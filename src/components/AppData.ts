import { IAppState, IProductItem, IOrderForm, IOrder, TFormErrors } from '../types/index';
import { Model } from './base/Model'; 

export type CatalogChangeEvent = {
    catalog: ProductItem[]
  };

export class ProductItem extends Model<IProductItem> {
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number | null;
}

export class AppState extends Model<IAppState> {
    catalog: ProductItem[];
    basket: ProductItem[] = [];
    preview: string | null;
    order: IOrder = {
        payment: 'online',
        address: '',
        email: '',
        phone: '',
        items: [],
        total: 0
    };
    formErrors: TFormErrors = {};
    
// установить каталог товаров
    setCatalog(items: IProductItem[]) {
        this.catalog = items.map(item => new ProductItem(item, this.events));
        this.emitChanges('items:changed', this.catalog);
    }

// обновить корзину
    updateBasket() {
        this.emitChanges('counter:changed', this.basket);
        this.emitChanges('basket:changed', this.basket);
    }

// добавить товар в корзину  
    addToBasket(item: ProductItem) {
        if (!this.basket.includes(item)) {
            this.basket.push(item);
            this.updateBasket();
        }
    }

// удалить товар из корзины
    removeFromBasket(item: ProductItem) {
        this.basket = this.basket.filter(basketItem => basketItem.id !== item.id);
        this.updateBasket();
    }


// очистить корзину
    clearBasket() {
        this.basket = [];
        this.emitChanges('basket.changed');
        this.updateBasket();
    }

// очистить данные заказа
    clearOrder() {
        this.order = {
            payment: 'online',
            address: '',
            email: '',
            phone: '',
            items: [],
            total: 0
        }
    }

//  установить превью карточки
    setPreview(item: ProductItem) {
        this.preview = item.id;
        this.emitChanges('preview:changed', item);
    }

// обновить значение поля формы заказа и проверить валидность  
    setOrderField(field: keyof Partial<IOrderForm>, value: string) {
        this.order[field] = value;
        this.validateOrderForm();
    }

// валидация формы заказа
    validateOrderForm() {
        const errors: TFormErrors = {};
        
        if (!this.order.payment) {
            errors.payment = 'Необходимо выбрать способ оплаты';
        }
        if (!this.order.address) {
            errors.address = 'Необходимо указать адрес';
        }
        if (!this.order.email) {
            errors.email = 'Необходимо указать email';
        }
        if (!this.order.phone) {
            errors.phone = 'Необходимо указать телефон';
        }

        this.formErrors = errors;
        this.events.emit('formErrors:change', this.formErrors);
        return Object.keys(errors).length === 0;
    }

}
