import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: { translation: {
    find: 'Find a charger', stations: 'Stations', availableNow: 'available now',
    search: 'Search by station, street or district', filters: 'Filters', reset: 'Reset all',
    networks: 'Networks', connectors: 'Connector type', allStations: 'All stations',
    map: 'Map', list: 'List', addStation: 'Add station', manage: 'Manage',
    live: 'Live data', open: 'Open station', noResults: 'No stations match your filters',
    queue: 'Queue', cars: 'cars', bestQueue: 'Nearest with shortest queue', findingBest: 'Finding the best station…',
    rating: 'Rating', stationReviews: 'Station reviews', driverFeedback: 'Driver feedback', reviewsCount: 'reviews',
    yourName: 'Your name', namePlaceholder: 'How should we call you?', yourRating: 'Your rating', yourReview: 'Your review',
    reviewPlaceholder: 'Tell other drivers about charging speed, access and service…', publishReview: 'Publish review', publishing: 'Publishing…',
    noReviews: 'No reviews yet', firstReview: 'Be the first to share your experience.', reviewPublished: 'Review published', reviewError: 'Could not publish the review',
  } },
  ru: { translation: {
    find: 'Найдите зарядку', stations: 'Станции', availableNow: 'доступно сейчас',
    search: 'Поиск по станции, улице или району', filters: 'Фильтры', reset: 'Сбросить',
    networks: 'Сети', connectors: 'Тип коннектора', allStations: 'Все станции',
    map: 'Карта', list: 'Список', addStation: 'Добавить станцию', manage: 'Управление',
    live: 'Данные онлайн', open: 'Открыть станцию', noResults: 'По вашему запросу ничего не найдено',
    queue: 'Очередь', cars: 'машин', bestQueue: 'Ближайшая с маленькой очередью', findingBest: 'Ищем лучшую станцию…',
    rating: 'Рейтинг', stationReviews: 'Отзывы о станции', driverFeedback: 'Мнения водителей', reviewsCount: 'отзывов',
    yourName: 'Ваше имя', namePlaceholder: 'Как к вам обращаться?', yourRating: 'Ваша оценка', yourReview: 'Ваш отзыв',
    reviewPlaceholder: 'Расскажите о скорости зарядки, доступе и обслуживании…', publishReview: 'Опубликовать отзыв', publishing: 'Публикуем…',
    noReviews: 'Отзывов пока нет', firstReview: 'Станьте первым, кто поделится впечатлением.', reviewPublished: 'Отзыв опубликован', reviewError: 'Не удалось опубликовать отзыв',
  } },
  uz: { translation: {
    find: 'Quvvatlash joyini toping', stations: 'Stansiyalar', availableNow: 'hozir mavjud',
    search: 'Stansiya, ko‘cha yoki tuman bo‘yicha qidiring', filters: 'Filtrlar', reset: 'Tozalash',
    networks: 'Tarmoqlar', connectors: 'Ulagich turi', allStations: 'Barcha stansiyalar',
    map: 'Xarita', list: 'Ro‘yxat', addStation: 'Stansiya qo‘shish', manage: 'Boshqarish',
    live: 'Jonli ma’lumot', open: 'Stansiyani ochish', noResults: 'Filtrlarga mos stansiya topilmadi',
    queue: 'Navbat', cars: 'mashina', bestQueue: 'Eng yaqin, navbati qisqa', findingBest: 'Eng yaxshi stansiya qidirilmoqda…',
    rating: 'Reyting', stationReviews: 'Stansiya sharhlari', driverFeedback: 'Haydovchilar fikri', reviewsCount: 'sharh',
    yourName: 'Ismingiz', namePlaceholder: 'Sizga qanday murojaat qilaylik?', yourRating: 'Bahoyingiz', yourReview: 'Sharhingiz',
    reviewPlaceholder: 'Quvvatlash tezligi, kirish va xizmat haqida yozing…', publishReview: 'Sharhni yuborish', publishing: 'Yuborilmoqda…',
    noReviews: 'Hozircha sharhlar yo‘q', firstReview: 'Birinchi bo‘lib tajribangizni ulashing.', reviewPublished: 'Sharh e’lon qilindi', reviewError: 'Sharhni e’lon qilib bo‘lmadi',
  } },
}

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('charge-language') || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
