import './scss/styles.scss';

import { StoreApi } from './components/StoreApi';
import { API_URL, CDN_URL } from "./utils/constants";
import { EventEmitter } from "./components/base/events";
import { cloneTemplate, createElement, ensureElement } from "./utils/utils";
import { AppState, CatalogChangeEvent, ProductItem } from "./components/AppData";
import { Page } from "./components/Page";
import { Basket } from "./components/Basket";
import { Order, PaymentMethods, Contacts } from "./components/Order";
import { Modal } from "./components/common/Modal";
import { Card } from "./components/Card";
import { IProductItem, IOrderForm, IOrder } from "./types/index";
import { Success } from "./components/Success";

const events = new EventEmitter();
const api = new StoreApi(CDN_URL, API_URL);

// Мониторинг всех событий, для отладки
events.onAll(({ eventName, data }) => {
    console.log(eventName, data);
})

// Подключение всех шаблонов для частей интерфейса
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// Модель данных приложения и управления состоянием
const appData = new AppState({}, events);

// Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

// Переиспользуемые части интерфейса
const basket = new Basket(cloneTemplate(basketTemplate), events);
const order = new Order(cloneTemplate(orderTemplate), events, {
  onClick: (ev: Event) => events.emit('payment:toggle', ev.target)
});
const contacts = new Contacts(cloneTemplate(contactsTemplate), events);

// Дальше идет бизнес-логика
// Поймали событие, сделали что нужно

// Обработка изменения каталога товаров
events.on<CatalogChangeEvent>('items:changed', () => {
    page.catalog = appData.catalog.map(item => {
      const card = new Card(cloneTemplate(cardCatalogTemplate), {
        onClick: () => events.emit('card:select', item)
      });
      return card.render({
        title: item.title,
        image: item.image,
        price: item.price,
        category: item.category
      })
    })
});

// Событие перехода к оформлению заказа
events.on('order:submit', () => {
    modal.render({
      content: contacts.render({
        email: '',
        phone: '',
        valid: false,
        errors: []
      })
    })
})
  
// Отправка формы заказа
events.on('contacts:submit', () => {
    api.orderProducts(appData.order)
      .then((result) => {
        appData.clearBasket();
        appData.clearOrder();
        const success = new Success(cloneTemplate(successTemplate), {
            onClick: () => {
                modal.close();
            }
        });
        success.total = result.total.toString();
        modal.render({
            content: success.render({})
        });
      })
      .catch(error => {
          console.log(error);
      });
})

// Измение состояния валидации формы, обработка ошибок
events.on('formErrors:change', (errors: Partial<IOrder>) => {
    const {payment, address ,email, phone} = errors;
    order.valid = !payment && !address;
    contacts.valid = !email && !phone;
    order.errors = Object.values({payment, address}).filter(i => !!i).join('; ');
    contacts.errors = Object.values({phone, email}).filter(i => !!i).join('; ');
  });
  
// Изменение полей заказа и контактов 
const changeEvent = (data: {field: keyof IOrderForm, value: string}) => {
    appData.setOrderField(data.field, data.value);
};
events.on(/^order\..*:change/, changeEvent);
events.on(/^contacts\..*:change/, changeEvent);

// Открытие формы заказа  
events.on('order:open', () => {
    modal.render({
      content: order.render({
        payment: '',
        address: '',
        valid: false,
        errors:[]
      })
    })
    appData.order.items = appData.basket.map((item) => item.id);
})

// Обработка изменения карточки товара для предпросмотра
events.on('preview:changed', (item: ProductItem) => {
    const card = new Card(cloneTemplate(cardPreviewTemplate), {
      onClick: () => {
        events.emit('product:toggle', item);
        card.buttonText = (appData.basket.indexOf(item) < 0) ? 'Купить' : 'Удалить из корзины'
      }
    });
    modal.render({
      content: card.render({
        title: item.title,
        description: item.description,
        image: item.image,
        price: item.price,
        category: item.category,
        buttonText: (appData.basket.indexOf(item) < 0) ? 'Купить' : "Удалить из корзины"
      })
    })
})

// Открытие предпросмотра карточки товара
events.on('card:select', (item: ProductItem) => {
    appData.setPreview(item);
})

// Обработка добавления товара в корзину
events.on('product:add', (item: ProductItem) => {
    appData.addToBasket(item);
  
})

// Обработка удаления товара из корзины
events.on('product:delete', (item: ProductItem) => {
    appData.removeFromBasket(item)
})

// Переключение состояния товара (добавить или удалить из корзины)
events.on('product:toggle', (item: ProductItem) => {
    if(appData.basket.indexOf(item) < 0){
      events.emit('product:add', item);
    }
    else{
      events.emit('product:delete', item);
    }
})

// Изменение состояния корзины и отображение
events.on('basket:changed', (items: ProductItem[]) => {
    basket.items = items.map((item, index) => {
      const card = new Card(cloneTemplate(cardBasketTemplate), {
        onClick: () => {
          events.emit('product:delete', item)
        }
      });
      return card.render({
        index: (index+1).toString(),
        title: item.title,
        price: item.price,
      })
    })
    const total = items.reduce((total, item) => total + item.price, 0)
    basket.total = total
    appData.order.total = total;
    const disabled = total===0;
    basket.toggleButton(disabled)
})

// Открытие корзины
events.on('basket:open', () => {
    modal.render({
      content: basket.render({})
    })
})

// Изменение счётчика товаров в корзине
events.on('counter:changed', (event: string[]) => {
    page.counter = appData.basket.length;
})

// Переключение способа оплаты
events.on('payment:toggle', (target: HTMLElement) => {
  if(!target.classList.contains('button_alt-active')){
    order.togglePayButtons(target as HTMLButtonElement);
    appData.order.payment = PaymentMethods[target.getAttribute('name') as keyof typeof PaymentMethods];
  }
})

// Открытие модальное окно
events.on('modal:open', () => {
    page.locked = true;
})
  
// Закрытие модальное окно
events.on('modal:close', () => {
    page.locked = false;
})
  
//Запрос списка товаров через API
api.getProductList()
    .then(appData.setCatalog.bind(appData))

    .catch(error => {
        console.log(error);
});