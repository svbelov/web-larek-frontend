// интерфейс для описания структуры данных одного товара
export interface IProductItem  {
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number | null;
}

// интерфейс общего состояния приложения
export interface IAppState {
    catalog: IProductItem[];
    basket: IProductItem[];
    preview: string | null;
    order: IOrder | null;
	formErrors: TFormErrors;
}

// интерфейс формы заказа
export interface IOrderForm {
    payment: string;
    address: string;
    email: string;
    phone: string;
}

export interface IOrder extends IOrderForm {
    items: string[];
    total: number | null;
}

// тип возможных ошибок валидации
export type TFormErrors = {
    payment?: string;
    address?: string;
    email?: string;
    phone?: string;
}
