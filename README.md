# KKTC TÜFE Değişim Analizi 📊

Bu web uygulaması, Kuzey Kıbrıs Türk Cumhuriyeti (KKTC) Tüketici Fiyat Endeksi (TÜFE) ana harcama gruplarındaki değişim oranlarını belirli iki tarih (Ay-Yıl) arasında hesaplamak ve görselleştirmek için geliştirilmiştir.

[![GitHub Pages Deploy](https://github.com/RYucel/TUFE_hesaplama_v3/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/RYucel/TUFE_hesaplama_v3/actions/workflows/pages/pages-build-deployment)

**🚀 Uygulamayı Deneyin:** **[https://ryucel.github.io/TUFE_hesaplama_v3/](https://ryucel.github.io/TUFE_hesaplama_v3/)**

<!-- TODO: Buraya uygulamanın güzel bir ekran görüntüsünü ekleyin -->
<!-- ![Uygulama Ekran Görüntüsü](screenshot.png) -->

---

## ✨ Hakkında

Bu araç, kullanıcının seçtiği başlangıç ve bitiş tarihleri arasındaki KKTC TÜFE verilerini kullanarak:

*   **Genel Endeks Değişimini:** Belirtilen dönemdeki toplam enflasyon oranını (%) ana gösterge olarak sunar.
*   **Ana Harcama Grubu Değişimlerini:** 12 ana harcama grubunun (Gıda, Konut, Ulaştırma vb.) her biri için ayrı ayrı yüzdesel değişim oranlarını hesaplar.
*   **Karşılaştırmalı Analiz:** Her bir harcama grubunun değişim oranını, Genel Endeks değişim oranıyla karşılaştırır. Genelden daha fazla artan gruplar kırmızı yukarı ok (↑) ve kırmızı yüzde değeriyle, daha az artan (veya daha fazla düşen) gruplar ise yeşil aşağı ok (↓) ve yeşil yüzde değeriyle belirtilir.
*   **Görselleştirme:** Tüm harcama gruplarının değişim oranlarını içeren interaktif bir çubuk grafik sunar.

Uygulama, Progressive Web App (PWA) teknolojisi kullanılarak geliştirilmiştir, bu sayede modern tarayıcılarda çevrimdışı erişim ve cihaza yükleme gibi özellikler sunabilir.

## 🚀 Nasıl Kullanılır?

1.  Yukarıdaki **[Uygulamayı Deneyin!](https://ryucel.github.io/TUFE_hesaplama_v3/)** linkine tıklayın.
2.  **Başlangıç Tarihi** ve **Bitiş Tarihi** alanlarına tıklayarak veya dokunarak açılan takvimden istediğiniz **Yıl** ve **Ay**'ı seçin. (Veri aralığı genellikle Ocak 2001 ile güncel tarih arasındadır).
3.  **"Değişimi Hesapla"** butonuna tıklayın.
4.  Sonuçlar aşağıdaki bölümlerde gösterilecektir:
    *   **Ana Endeks (Genel) Değişimi:** Vurgulu kutu içinde.
    *   **Detaylı Değişim Oranları:** Her harcama grubu için yüzdesel değişim ve genel endekse göre karşılaştırmalı ok ikonu.
    *   **Değişim Oranı Grafiği:** Tüm grupların karşılaştırmalı çubuk grafiği.

## 🔧 Teknolojiler ve Veri

*   **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
*   **Grafik:** [Chart.js](https://www.chartjs.org/)
*   **CSV İşleme:** [PapaParse](https://www.papaparse.com/)
*   **Tarih Seçici:** [flatpickr](https://flatpickr.js.org/) (MonthSelect Plugin ile)
*   **Hosting:** [GitHub Pages](https://pages.github.com/)
*   **PWA:** Service Worker, Manifest

**Veri Kaynağı:**

Uygulama, reponun içinde bulunan `KKTC_TUFE_HarcamaGruplar_2001-2025.csv` dosyasındaki verileri kullanır. Bu dosya, 2001 yılından itibaren aylık TÜFE endeks değerlerini ana harcama grupları bazında içermektedir.

*Not: Bu CSV dosyasındaki verilerin doğruluğu ve güncelliği, dosyanın kaynağına bağlıdır. Resmi ve en güncel veriler için ilgili KKTC kurumlarının yayınları referans alınmalıdır.*

##  PWA Özellikleri

*   **Çevrimdışı Erişim:** Service Worker sayesinde, uygulama ilk ziyaretinizden sonra internet bağlantısı olmasa bile (cache'lenen verilerle) çalışabilir.
*   **Yüklenebilirlik:** Destekleyen tarayıcılarda ve işletim sistemlerinde, uygulamayı bir masaüstü veya mobil cihazınıza "yükleyerek" normal bir uygulama gibi kullanabilirsiniz (Genellikle adres çubuğunda bir yükleme ikonu belirir).

##  Geliştirme Ortamı

Projeyi lokal makinenizde çalıştırmak isterseniz:

1.  Repoyu klonlayın:
    ```bash
    git clone https://github.com/RYucel/TUFE_hesaplama_v3.git
    ```
2.  Proje klasörüne gidin:
    ```bash
    cd TUFE_hesaplama_v3
    ```
3.  `index.html` dosyasını doğrudan tarayıcıda açabilirsiniz. Ancak, Service Worker gibi PWA özelliklerinin düzgün çalışması için dosyaları bir lokal web sunucusu üzerinden sunmanız önerilir. Bunun için `http-server` gibi basit bir araç kullanabilirsiniz:
    ```bash
    # Eğer kurulu değilse: npm install -g http-server
    http-server .
    ```
    Ardından tarayıcınızda `http://localhost:8080` (veya `http-server`'ın belirttiği port) adresine gidin.

## 🐛 Hata Bildirimi ve Geri Bildirim

Uygulamada bir hata bulursanız veya iyileştirme önerileriniz varsa, lütfen GitHub repository'sinin **[Issues](https://github.com/RYucel/TUFE_hesaplama_v3/issues)** bölümünden yeni bir bildirim oluşturun.

## 📜 Lisans

Bu proje [MIT Lisansı](LICENSE) ile lisanslanmıştır. (Eğer bir LICENSE dosyası eklemediyseniz, MIT lisans metnini içeren bir `LICENSE` dosyası oluşturmanız önerilir).

---

Umarım bu araç faydalı olur!
