#include <Arduino.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <ESP32Servo.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <time.h>

// ================= FIREBASE AYARLARI =================
#define ENABLE_USER_AUTH
#define ENABLE_DATABASE
#include <FirebaseClient.h>
#include <FirebaseJson.h>

#define WIFI_SSID "Your_WiFi_SSID"
#define WIFI_PASSWORD "Your_WiFi_Password"

#define Web_API_KEY "Your_API_Key"
#define DATABASE_URL "Your_Database_URL"
#define USER_EMAIL "Your_Email"
#define USER_PASS "Your_Password"

// ================= LCD AYARLARI (ÇİFT EKRAN) =================
// Giriş Ekranı (0x27)
LiquidCrystal_I2C lcdIn(0x27, 16, 2);
// Çıkış Ekranı (0x26 - Eğer çalışmazsa 0x25 veya 0x3F dene)
LiquidCrystal_I2C lcdOut(0x26, 16, 2);

// ================= PIN TANIMLARI =================
const int TRIG_PIN = 25;
const int ECHO_PINS[8] = {
    13, 14, 16, 17, 32, 33, // Slot 1-6
    34,                     // Giriş Sensörü
    35                      // Çıkış Sensörü
};
const int LED_PINS[6] = {2, 4, 5, 12, 15, 23};
const int SERVO_IN_PIN = 18;
const int SERVO_OUT_PIN = 19;
const int BUZZER_PIN = 26;

// ================= MESAFE & HESAPLAMA AYARLARI =================
const long OCCUPIED_MIN_CM = 2;       
const long OCCUPIED_ON_MAX_CM = 9;    
const long OCCUPIED_OFF_MIN_CM = 14;  

const long CAR_DETECT_MIN_CM = 2;
const long CAR_DETECT_MAX_CM = 10;
const float RATE_PER_HOUR[6] = {50, 50, 50, 50, 20, 20};

// SERVO AÇILARI
const int IN_OPEN_ANGLE   = 90;
const int IN_CLOSE_ANGLE  = 180;
const int OUT_OPEN_ANGLE  = 0;
const int OUT_CLOSE_ANGLE = 70;

// ZAMANLAMALAR
const unsigned long GATE_OPEN_TIME = 3000;
const unsigned long GATE_EXIT_TIME = 5000; 

Servo servoIn;
Servo servoOut;

// SLOT & DURUM DEĞİŞKENLERİ
bool slotOccupied[6] = {false};
bool slotReserved[6] = {false};
bool slotPaid[6]     = {false}; 
unsigned long slotEnterTime[6] = {0};
unsigned long slotDebounceTime[6] = {0};
const unsigned long DEBOUNCE_DELAY = 300;

// KAPILAR
unsigned long servoInTimer = 0;             
bool isServoInOpen = false;                 
unsigned long servoOutTimer = 0;            
bool isServoOutOpen = false;                

// EKRAN STATE YÖNETİMİ
// --- Giriş Ekranı ---
bool inWelcomeMode = false;
unsigned long inWelcomeTimer = 0;
unsigned long lcdInCycleTimer = 0;
bool lcdInShowReservedPage = false;

// --- Çıkış Ekranı ---
int pendingExitSlot = -1; // Çıkış yapıp ödeme bekleyen slot
bool outGoodbyeMode = false;
unsigned long outGoodbyeTimer = 0;

// SİSTEM
unsigned long ledBlinkTimer = 0;
bool ledBlinkState = false;
unsigned long lastPollTime = 0;
bool isOnline = false;

const char *ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 3600 * 3; 
const int daylightOffset_sec = 0;

// ================= FIREBASE NESNELERİ =================
UserAuth user_auth(Web_API_KEY, USER_EMAIL, USER_PASS);
FirebaseApp app;
WiFiClientSecure ssl_client;
using AsyncClient = AsyncClientClass;
AsyncClient aClient(ssl_client);
RealtimeDatabase Database;

// ================= YARDIMCI FONKSİYONLAR =================
unsigned long getUnixTime() {
  if (!isOnline) return millis() / 1000;
  time_t now;
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) return millis() / 1000;
  time(&now);
  return now;
}

// MESAFE ÖLÇÜMÜ (Filtreli)
long measureDistanceCM(int echoPin) {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long duration = pulseIn(echoPin, HIGH, 6000); 
  if (duration == 0) return 9999;
  return duration * 0.0343 / 2;
}

long measureDistanceFiltered(int echoPin) {
  long sum = 0;
  int count = 0;
  for (int k = 0; k < 2; k++) {
    long d = measureDistanceCM(echoPin);
    if (d < 500) { sum += d; count++; }
    delay(2);
  }
  return (count == 0) ? 9999 : sum / count;
}

// ================= FIREBASE CALLBACKS =================
void processData(AsyncResult &aResult) {
  if (aResult.isError()) return;
  if (!aResult.available()) return;

  RealtimeDatabaseResult &result = aResult.to<RealtimeDatabaseResult>();
  String path = result.dataPath();
  String data = result.to<const char *>();

  if (!(path == "/parking" || path == "/" || path.length() == 0)) return;

  FirebaseJson json;
  FirebaseJsonData d;
  json.setJsonData(data);

  for (int i = 0; i < 6; i++) {
    String slotKey = "slot" + String(i + 1);
    
    // Rezervasyon
    json.get(d, slotKey + "/isReserved");
    if (d.success) slotReserved[i] = d.to<bool>();

    // Ödeme
    json.get(d, slotKey + "/isPayment");
    if (d.success) slotPaid[i] = d.to<bool>();
  }
}

void fb_updateSlotStatus(int slot, bool occupied, unsigned long entryTime) {
  if (!isOnline) return;
  String base = "/parking/slot" + String(slot + 1);
  FirebaseJson json;
  json.set("isOccupied", occupied);
  if (occupied) {
    json.set("entryTime", (int)entryTime);
    json.set("isReserved", false);
  }
  Database.update(aClient, base, object_t(json.raw()), processData, "set_enter");
}

void fb_updateExitInfo(int slot, unsigned long exitTime, float fee) {
  if (!isOnline) return;
  String base = "/parking/slot" + String(slot + 1);
  FirebaseJson json;
  json.set("isOccupied", false);
  json.set("exitTime", (int)exitTime);
  json.set("fee", fee);
  json.set("isPayment", false); 
  Database.update(aClient, base, object_t(json.raw()), processData, "set_exit");
}

void fb_resetAfterExit(int slot) {
  if (!isOnline) return;
  String base = "/parking/slot" + String(slot + 1);
  FirebaseJson json;
  json.set("isOccupied", false);
  json.set("isPayment", false);
  json.set("isReserved", false);
  json.set("fee", 0);
  json.set("entryTime", 0);
  json.set("exitTime", 0);
  Database.update(aClient, base, object_t(json.raw()), processData, "reset_all");
}

void pollAllSlots() {
  if (!isOnline) return;
  Database.get(aClient, "/parking", processData, false, "poll_all");
}

// ================= EKRAN YÖNETİMİ (ÇİFT EKRAN) =================

// 1. GİRİŞ EKRANI (lcdIn)
void updateEntranceLCD(int freeCount) {
  unsigned long now = millis();

  // Eğer Hoşgeldiniz modu açıksa ve süresi dolduysa kapat
  if (inWelcomeMode && (now - inWelcomeTimer > 3000)) {
    inWelcomeMode = false;
    lcdIn.clear();
  }

  // Hoşgeldiniz modundaysak hiçbir şey yapma (Loop'ta yazıldı zaten)
  if (inWelcomeMode) return;

  // --- IDLE MOD (Döngülü Ekran) ---
  if (now - lcdInCycleTimer > 3000) {
    lcdInCycleTimer = now;
    
    // Rezerve var mı kontrol et
    bool anyReserved = false;
    for(int i=0; i<6; i++) if(slotReserved[i]) anyReserved = true;
    
    if(anyReserved) lcdInShowReservedPage = !lcdInShowReservedPage;
    else lcdInShowReservedPage = false;
    
    lcdIn.clear();
  }

  if (!lcdInShowReservedPage) {
    // Ana Sayfa: Durum ve Boş Yer
    lcdIn.setCursor(0, 0);
    lcdIn.print(isOnline ? "KULTUR OTOPARK  " : "Sistem: Offline ");
    lcdIn.setCursor(0, 1);
    if (freeCount == 0) lcdIn.print("Park DOLU       ");
    else {
      lcdIn.print("Bos Yer: "); lcdIn.print(freeCount); lcdIn.print("      ");
    }
  } else {
    // Rezerve Sayfası
    String resStr = "";
    for (int i = 0; i < 6; i++) {
      if (slotReserved[i]) resStr += String(i + 1) + " ";
    }
    lcdIn.setCursor(0, 0);
    lcdIn.print("Lutfen Girmeyin:");
    lcdIn.setCursor(0, 1);
    lcdIn.print("Rsrv: "); lcdIn.print(resStr);
  }
}

// 2. ÇIKIŞ EKRANI (lcdOut)
void updateExitLCD() {
  unsigned long now = millis();

  // Eğer Güle Güle modu açıksa ve süresi dolduysa kapat
  if (outGoodbyeMode) {
    if (now - outGoodbyeTimer > 3000) {
      outGoodbyeMode = false;
      lcdOut.clear();
    }
    return; // Mod aktifken başka bir şey yazdırma
  }

  // Eğer ödeme bekleyen bir slot varsa onu göster
  if (pendingExitSlot != -1) {
    static unsigned long lastUpdate = 0;
    if (now - lastUpdate > 1000) {
      lastUpdate = now;
      lcdOut.setCursor(0, 0);
      lcdOut.print("SLOT: "); lcdOut.print(pendingExitSlot + 1); lcdOut.print(" ODEME   ");
      lcdOut.setCursor(0, 1);
      lcdOut.print("BEKLENIYOR...   ");
    }
  } else {
    // Kimse yoksa boş bırak
    static unsigned long lastClear = 0;
    if (now - lastClear > 2000) { // Sürekli clear yapıp titretmemek için
       lastClear = now;
       lcdOut.clear();
    }
  }
}

// ================= SETUP =================
void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);

  // --- İKİ EKRANI DA BAŞLAT ---
  lcdIn.init();  lcdIn.backlight();
  lcdOut.init(); lcdOut.backlight();
  
  pinMode(TRIG_PIN, OUTPUT);
  for (int i = 0; i < 8; i++) pinMode(ECHO_PINS[i], INPUT);
  for (int i = 0; i < 6; i++) pinMode(LED_PINS[i], OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  servoIn.attach(SERVO_IN_PIN);
  servoOut.attach(SERVO_OUT_PIN);
  servoIn.write(IN_CLOSE_ANGLE);  
  servoOut.write(OUT_CLOSE_ANGLE);  
  
  lcdIn.setCursor(0, 0); lcdIn.print("Giris Aktif...  ");
  lcdOut.setCursor(0, 0); lcdOut.print("Cikis Aktif...  ");
  delay(1000); 
  lcdIn.clear(); 
  lcdOut.clear();

  Serial.print("WiFi Baglaniyor");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int tryCount = 0;
  while (WiFi.status() != WL_CONNECTED && tryCount < 20) {
    delay(500); Serial.print("."); tryCount++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    isOnline = true;
    Serial.println("\n[DURUM] ONLINE");
    configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
    
    ssl_client.setInsecure();
    ssl_client.setHandshakeTimeout(25000);
    aClient.setSessionTimeout(25000);
    
    initializeApp(aClient, app, getAuth(user_auth));
    app.getApp<RealtimeDatabase>(Database);
    Database.url(DATABASE_URL);
  } else {
    isOnline = false;
    Serial.println("\n[DURUM] OFFLINE");
  }
  delay(1000);
}

// ================= LOOP =================
void loop() {
  unsigned long now = millis();

  if (WiFi.status() != WL_CONNECTED) isOnline = false;
  else if (!isOnline && WiFi.status() == WL_CONNECTED) isOnline = true;

  if (isOnline) app.loop();

  // Veri Çekme
  if (isOnline && (now - lastPollTime > 2000)) {
    lastPollTime = now;
    pollAllSlots();
  }

  // LED Blink
  if (now - ledBlinkTimer >= 500) {
    ledBlinkTimer = now;
    ledBlinkState = !ledBlinkState;
  }

  // ---------------- SLOT KONTROLÜ ----------------
  for (int i = 0; i < 6; i++) {
    long d;
    if (i == 5) d = 5; // Slot 6 Hilesi (Korundu)
    else d = measureDistanceFiltered(ECHO_PINS[i]);

    bool instantState = slotOccupied[i];
    if (d > OCCUPIED_MIN_CM && d < OCCUPIED_ON_MAX_CM) instantState = true;
    else if (d > OCCUPIED_OFF_MIN_CM || d == 9999) instantState = false;

    if (instantState != slotOccupied[i]) {
      if (slotDebounceTime[i] == 0) slotDebounceTime[i] = now;
      
      if (now - slotDebounceTime[i] > DEBOUNCE_DELAY) {
        bool wasOccupied = slotOccupied[i];
        slotOccupied[i] = instantState;
        slotDebounceTime[i] = 0;

        // -- ARAÇ GİRDİ --
        if (!wasOccupied && slotOccupied[i]) {
          slotEnterTime[i] = getUnixTime();
          slotReserved[i] = false; 
          fb_updateSlotStatus(i, true, slotEnterTime[i]);
        } 
        // -- ARAÇ ÇIKTI --
        else if (wasOccupied && !slotOccupied[i]) {
          unsigned long exitTime = getUnixTime();
          unsigned long duration = exitTime - slotEnterTime[i];
          float hours = duration / 3600.0;
          if (hours < 0.05) hours = 0.05;
          float fee = RATE_PER_HOUR[i] * hours;
          
          // Çıkış yapan slotu işaretle -> Exit LCD'yi tetikler
          pendingExitSlot = i;
          
          if (isOnline) fb_updateExitInfo(i, exitTime, fee);
        }
      }
    } else {
      slotDebounceTime[i] = 0;
    }

    // LED'ler
    if (slotOccupied[i]) digitalWrite(LED_PINS[i], HIGH);
    else if (isOnline && slotReserved[i]) digitalWrite(LED_PINS[i], ledBlinkState ? HIGH : LOW);
    else digitalWrite(LED_PINS[i], LOW);
  }

  // Boş yer hesabı
  int freeCount = 0;
  for (int i = 0; i < 6; i++) if (!slotOccupied[i]) freeCount++;

  // --- EKRANLARI GÜNCELLE ---
  updateEntranceLCD(freeCount);
  updateExitLCD();

  // ---------------- GİRİŞ KAPISI ----------------
  if (isServoInOpen && (now - servoInTimer > GATE_OPEN_TIME)) {
    servoIn.write(IN_CLOSE_ANGLE); 
    isServoInOpen = false;
  }

  long entryDist = measureDistanceFiltered(ECHO_PINS[6]); 
  if (!isServoInOpen && entryDist > CAR_DETECT_MIN_CM && entryDist < CAR_DETECT_MAX_CM) {
    if (freeCount > 0) {
      // SADECE GİRİŞ EKRANINI DEĞİŞTİR
      inWelcomeMode = true;
      inWelcomeTimer = now;
      lcdIn.clear();
      lcdIn.setCursor(0, 0); lcdIn.print("  HOSGELDINIZ   ");
      lcdIn.setCursor(0, 1); lcdIn.print(" Kapi Aciliyor  ");
      
      servoIn.write(IN_OPEN_ANGLE); 
      isServoInOpen = true;
      servoInTimer = now;
    } else {
      tone(BUZZER_PIN, 1000, 500); 
    }
  }

  // ---------------- ÇIKIŞ KAPISI VE ÖDEME ----------------
  
  // Kapı Kapanma
  if (isServoOutOpen && (now - servoOutTimer > GATE_EXIT_TIME)) {
    servoOut.write(OUT_CLOSE_ANGLE); 
    isServoOutOpen = false;
    
    // İşlem bitti, çıkış verilerini temizle
    if (pendingExitSlot != -1) {
      fb_resetAfterExit(pendingExitSlot);
      slotPaid[pendingExitSlot] = false;
      pendingExitSlot = -1;
    }
    lcdOut.clear(); // Ekranı temizle
  }

  // Eğer ödeme yapıldıysa ve bekleyen araç varsa kapıyı aç
  if (!isServoOutOpen && pendingExitSlot != -1) {
    
    // Online ödeme kontrolü
    bool isPaid = false;
    if (isOnline && slotPaid[pendingExitSlot] == true) isPaid = true;
    else if (!isOnline) isPaid = true; // Offline modda test için otomatik geçir
    
    if (isPaid) {
      tone(BUZZER_PIN, 2000, 250);
      
      // SADECE ÇIKIŞ EKRANINI DEĞİŞTİR
      outGoodbyeMode = true;
      outGoodbyeTimer = now;
      lcdOut.clear();
      lcdOut.setCursor(0, 0); lcdOut.print("   GULE GULE    ");
      lcdOut.setCursor(0, 1); lcdOut.print(" Yine Bekleriz  ");
      
      servoOut.write(OUT_OPEN_ANGLE);
      isServoOutOpen = true;
      servoOutTimer = now;
    }
  }
  
  delay(5);
}