document.addEventListener('DOMContentLoaded', () => {
    // DOM Elementleri
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const calculateButton = document.getElementById('calculateButton');
    const resultsDiv = document.getElementById('results');
    const mainIndexResultDiv = document.getElementById('mainIndexResult');
    const categoryResultsDiv = document.getElementById('categoryResults');
    const resultsTitle = document.getElementById('resultsTitle');
    const chartCanvas = document.getElementById('tufeChart');
    const loadingMessage = document.getElementById('loadingMessage');
    const errorMessageDiv = document.getElementById('errorMessage');
    const dateInfoText = document.getElementById('dateInfoText');

    // Global Değişkenler
    let tufeData = [];
    let categoryHeaders = [];
    let chartInstance = null;
    let availableDates = [];
    let flatpickrStartInstance = null;
    let flatpickrEndInstance = null;

    // --- Yardımcı Fonksiyonlar ---

    // CSV'deki "Jan-01" gibi formatı "YYYY-MM" formatına çevirme
    function parseCsvDate(csvDate) {
        if (!csvDate || typeof csvDate !== 'string' || !csvDate.includes('-')) return null;
        const parts = csvDate.trim().split('-');
        if (parts.length !== 2) return null;
        const monthAbbr = parts[0];
        const yearSuffix = parts[1];
        if (isNaN(parseInt(yearSuffix))) return null;
        const months = {'Jan':'01','Feb':'02','Mar':'03','Apr':'04','May':'05','Jun':'06','Jul':'07','Aug':'08','Sep':'09','Oct':'10','Nov':'11','Dec':'12'};
        const month = months[monthAbbr];
        if (!month) return null;
        const year = parseInt(yearSuffix);
        const fullYear = year < 100 ? `20${yearSuffix.padStart(2, '0')}` : year.toString();
        if (parseInt(fullYear) < 2000 || parseInt(fullYear) > 2099) return null;
        return `${fullYear}-${month}`;
    }

    // İki değer arasındaki yüzde değişimi hesaplama
    function calculatePercentageChange(startValue, endValue) {
        if (startValue === null || endValue === null || isNaN(startValue) || isNaN(endValue) || typeof startValue !== 'number' || typeof endValue !== 'number') {
            return null;
        }
        if (startValue === 0) { return null; }
        return ((endValue - startValue) / startValue) * 100;
    }

    // Sayıyı yüzde formatında string olarak döndürme
    function formatPercentage(value) {
        if (value === null || isNaN(value)) { return "N/A"; }
        return `${value.toFixed(2)}%`;
    }

    // Hata mesajını gösterme
    function showError(message) {
        errorMessageDiv.textContent = message;
        errorMessageDiv.style.display = 'block';
        resultsDiv.style.display = 'none';
        loadingMessage.style.display = 'none';
    }

    // Hata mesajını gizleme
    function hideError() { errorMessageDiv.style.display = 'none'; }

    // YYYY-MM formatını "Ay Yıl" formatına çeviren yardımcı fonksiyon (Türkçe)
    function formatDateForDisplay(yyyyMM) {
        if (!yyyyMM || !yyyyMM.includes('-')) return yyyyMM;
        const [year, month] = yyyyMM.split('-');
        const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
        const monthIndex = parseInt(month) - 1;
        if (monthIndex >= 0 && monthIndex < 12) {
            return `${monthNames[monthIndex]} ${year}`;
        }
        return yyyyMM;
    }


    // --- flatpickr Ayarları ---
    function setupDatePickers(minDate, maxDate, defaultStart, defaultEnd) {
        const commonOptions = {
            dateFormat: "Y-m",
            plugins: [
                new monthSelectPlugin({ shorthand: false, dateFormat: "Y-m", altFormat: "F Y" })
            ],
            minDate: minDate, maxDate: maxDate,
             locale: {
                firstDayOfWeek: 1,
                 months: {
                    shorthand: ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"],
                    longhand: ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"]
                }
             },
             ariaDateFormat: "F Y",
        };

        flatpickrStartInstance = flatpickr(startDateInput, {
            ...commonOptions, defaultDate: defaultStart, altInput: true,
            onChange: function(selectedDates, dateStr, instance) {
                 if (flatpickrEndInstance && selectedDates[0]) { flatpickrEndInstance.set('minDate', selectedDates[0]); }
            }
        });

        flatpickrEndInstance = flatpickr(endDateInput, {
            ...commonOptions, defaultDate: defaultEnd, altInput: true,
            onChange: function(selectedDates, dateStr, instance) {
                if (flatpickrStartInstance && selectedDates[0]) { flatpickrStartInstance.set('maxDate', selectedDates[0]); }
            }
        });
        console.log("flatpickr tarih seçiciler başlatıldı.");
    }


    // Tarih inputlarının limitlerini ve flatpickr'ı ayarlama
    function setDateInputLimitsAndPickers(data) {
        if (!data || data.length === 0) {
            showError("Veri setinde geçerli tarih bulunamadı."); calculateButton.disabled = true; return;
        };
        availableDates = data.map(d => d.formattedDate).filter(d => d !== null);
        if (availableDates.length === 0) {
            showError("Veri setinde geçerli formatta tarih bulunamadı."); calculateButton.disabled = true; return;
        }
        const firstDate = availableDates[0];
        const lastDate = availableDates[availableDates.length - 1];
        dateInfoText.textContent = `Veri Aralığı: ${formatDateForDisplay(firstDate)} - ${formatDateForDisplay(lastDate)}`;
        setupDatePickers(firstDate, lastDate, firstDate, lastDate);
        calculateButton.disabled = false;
        console.log("Tarih limitleri ayarlandı ve flatpickr başlatıldı.");
    }


    // Ana Veri Yükleme ve İşleme Fonksiyonu
    function loadData() {
        loadingMessage.style.display = 'flex';
        calculateButton.disabled = true;
        hideError();
        dateInfoText.textContent = '';

        fetch('KKTC_TUFE_HarcamaGruplar_2001-2025.csv')
            .then(response => {
                if (!response.ok) { throw new Error(`CSV dosyası yüklenemedi (${response.status})`); }
                return response.text();
            })
            .then(csvText => {
                 if (csvText.charCodeAt(0) === 0xFEFF) { csvText = csvText.substring(1); }
                Papa.parse(csvText, {
                    header: true, skipEmptyLines: true, dynamicTyping: false,
                    transformHeader: header => header.trim().replace(/^"\s*|\s*"$/g, ''),
                    complete: (results) => {
                        if (results.errors.length > 0) {
                            console.error("CSV Parse Hataları:", results.errors);
                            showError(`CSV işleme hatası (Satır ${results.errors[0].row}): ${results.errors[0].message}.`);
                            loadingMessage.style.display = 'none'; return;
                        }
                         if (!results.data || results.data.length === 0) {
                            showError("CSV dosyasında veri bulunamadı."); loadingMessage.style.display = 'none'; return;
                         }
                        categoryHeaders = results.meta.fields
                            .map(h => h.trim().replace(/^"\s*|\s*"$/g, ''))
                            .filter(h => h.toLowerCase() !== 'date');
                        tufeData = results.data.map((row, index) => {
                             const formattedDate = parseCsvDate(row.Date);
                             if (!formattedDate) { console.warn(`Geçersiz tarih atlanıyor: '${row.Date}' (Satır ${index + 2})`); return null; }
                            const formattedRow = { originalDate: row.Date, formattedDate: formattedDate };
                            categoryHeaders.forEach(cleanHeader => {
                                const originalHeader = results.meta.fields.find(h => h.trim().replace(/^"\s*|\s*"$/g, '') === cleanHeader);
                                const valueStr = row[originalHeader]; let value = null;
                                if (valueStr !== undefined && valueStr !== null && valueStr.trim() !== '') {
                                    value = parseFloat(valueStr.replace(',', '.'));
                                     if (isNaN(value)) { value = null; console.warn(`Geçersiz sayı: Tarih ${formattedDate}, Sütun '${cleanHeader}', Değer: '${valueStr}'`); }
                                } formattedRow[cleanHeader] = value;
                            }); return formattedRow;
                        })
                        .filter(row => row !== null)
                        .sort((a, b) => a.formattedDate.localeCompare(b.formattedDate));
                        if (tufeData.length === 0) {
                             showError("CSV dosyasında işlenebilir geçerli veri bulunamadı."); loadingMessage.style.display = 'none'; return;
                        }
                        console.log(`Toplam ${tufeData.length} geçerli veri satırı işlendi.`);
                        setDateInputLimitsAndPickers(tufeData);
                        loadingMessage.style.display = 'none';
                    },
                     error: (error) => { console.error("PapaParse hatası:", error); showError(`CSV dosyası okunamadı/işlenemedi: ${error.message}`); loadingMessage.style.display = 'none';}
                });
            })
            .catch(error => { console.error("Veri yükleme hatası:", error); showError(`Veri yüklenemedi: ${error.message}.`); loadingMessage.style.display = 'none'; });
    }

    // Hesaplama ve Sonuçları Gösterme Fonksiyonu
    function displayResults() {
        hideError();
        loadingMessage.style.display = 'flex';
        resultsDiv.style.display = 'none';

        const startDate = startDateInput.value;
        const endDate = endDateInput.value;

        const dateRegex = /^\d{4}-\d{2}$/;
        if (!startDate || !endDate || !dateRegex.test(startDate) || !dateRegex.test(endDate)) {
            showError("Lütfen geçerli başlangıç ve bitiş tarihleri seçin."); loadingMessage.style.display = 'none'; return;
        }
        if (startDate > endDate) {
             showError("Başlangıç tarihi, bitiş tarihinden sonra olamaz."); loadingMessage.style.display = 'none'; return;
        }
        if (!availableDates.includes(startDate)) {
            showError(`Seçilen başlangıç tarihi (${startDate}) veri setinde bulunmuyor.`); loadingMessage.style.display = 'none'; return;
        }
        if (!availableDates.includes(endDate)) {
             showError(`Seçilen bitiş tarihi (${endDate}) veri setinde bulunmuyor.`); loadingMessage.style.display = 'none'; return;
        }

        const startData = tufeData.find(d => d.formattedDate === startDate);
        const endData = tufeData.find(d => d.formattedDate === endDate);

        if (!startData || !endData) {
            showError("Seçilen tarihler için veri satırları bulunamadı."); loadingMessage.style.display = 'none'; return;
        }

        const changes = {};
        let hasValidCalculation = false;
        categoryHeaders.forEach(header => {
            const change = calculatePercentageChange(startData[header], endData[header]);
            changes[header] = change;
            if(change !== null && !isNaN(change)) { hasValidCalculation = true; }
        });

        if (!hasValidCalculation) {
             showError("Seçilen tarihler arasında hesaplanabilir geçerli veri bulunamadı."); loadingMessage.style.display = 'none'; return;
        }

        resultsTitle.textContent = `${formatDateForDisplay(startDate)} - ${formatDateForDisplay(endDate)} Arası Değişim Oranları (%)`;

        const genelHeader = categoryHeaders.find(h => h.toLowerCase().includes('genel'));
        let genelChange = null;
        if (genelHeader && changes[genelHeader] !== null && !isNaN(changes[genelHeader])) {
             genelChange = changes[genelHeader];
             mainIndexResultDiv.innerHTML = `
                 <span class="name">Ana Endeks (Genel) Değişimi:</span>
                 <span class="value">${formatPercentage(genelChange)}</span>
             `;
        } else {
            mainIndexResultDiv.innerHTML = `<span class="name">Ana Endeks (Genel) Değişimi Hesaplanamadı</span>`;
        }

        categoryResultsDiv.innerHTML = '';
        const otherCategories = categoryHeaders.filter(h => h !== genelHeader);
        otherCategories.forEach(header => {
            const change = changes[header];
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('category-item');
            const displayName = header.replace(/^\d+\.\s*/, '');

            let arrowHtml = '';
            let comparisonClass = 'compare-equal'; // Varsayılan (nötr/eşit/hesaplanamayan) sınıf

            if (genelChange !== null && change !== null && !isNaN(change)) {
                if (change > genelChange) {
                    arrowHtml = ' <span class="arrow up-arrow">↑</span>';
                    comparisonClass = 'compare-higher'; // Değer için sınıf
                } else if (change < genelChange) {
                    arrowHtml = ' <span class="arrow down-arrow">↓</span>';
                    comparisonClass = 'compare-lower'; // Değer için sınıf
                }
                // Eşitse, comparisonClass 'compare-equal' kalır, arrowHtml boş kalır
            }

            itemDiv.innerHTML = `
                <div class="name">${displayName}</div>
                <div class="value-container">
                    <span class="value ${comparisonClass}">${formatPercentage(change)}</span>
                    ${arrowHtml}
                </div>
            `;
            categoryResultsDiv.appendChild(itemDiv);
        });

        updateChart(changes); // Grafiği güncelle

        resultsDiv.style.display = 'block';
        loadingMessage.style.display = 'none';
    }


    // Grafik Güncelleme Fonksiyonu
    function updateChart(changes) {
         const chartLabels = [];
         const chartData = [];
         const increaseColor = '#DE350B'; // --accent-increase
         const decreaseColor = '#00875A'; // --accent-decrease

         categoryHeaders.forEach(header => {
             const change = changes[header];
             if (change !== null && !isNaN(change)) {
                 chartLabels.push(header.replace(/^\d+\.\s*/, ''));
                 chartData.push(change);
             }
        });

         const backgroundColors = chartData.map(value => value >= 0 ? increaseColor + 'B3' : decreaseColor + 'B3'); // %70 alpha
         const borderColors = chartData.map(value => value >= 0 ? increaseColor : decreaseColor);

        const chartConfig = {
            type: 'bar',
            data: {
                labels: chartLabels,
                datasets: [{
                    label: '% Değişim', data: chartData,
                    backgroundColor: backgroundColors, borderColor: borderColors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#172B4D', titleColor: '#FFFFFF', bodyColor: '#FFFFFF',
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) { label += ': '; }
                                const value = context.parsed.x;
                                if (value !== null) { label += formatPercentage(value); }
                                else { label += "N/A"; }
                                return label;
                            }
                        }
                    },
                     title: { display: false }
                },
                scales: {
                    y: { ticks: { color: '#5E6C84', font: { size: 11 } } },
                    x: {
                        beginAtZero: false,
                        ticks: { callback: function(value) { return value + '%'; }, color: '#5E6C84' },
                         grid: { color: '#EBECF0' }
                    }
                }
            }
        };

        if (chartInstance) { chartInstance.destroy(); }
        chartInstance = new Chart(chartCanvas.getContext('2d'), chartConfig);
    }

    // --- PWA Service Worker Kaydı ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('ServiceWorker kaydı başarılı:', reg.scope))
                .catch(err => console.warn('ServiceWorker kaydı başarısız:', err));
        });
    }

    // --- Uygulama Başlangıcı ---
    loadData();
    calculateButton.addEventListener('click', displayResults);

}); // DOMContentLoaded sonu