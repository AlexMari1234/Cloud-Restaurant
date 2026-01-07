import { Model } from 'mongoose';
import { CartDocument } from '../schemas/cart.schema';
import { ProductDocument } from '../../menu/schemas/product.schema';
import { CartResponseDto } from '@rm/common';
export declare class CartService {
    private readonly cartModel;
    private readonly productModel;
    constructor(cartModel: Model<CartDocument>, productModel: Model<ProductDocument>);
    private getProduct;
    private calculateTotal;
    private toResponseDto;
    getCart(customerId: string, restaurantId: string): Promise<CartResponseDto>;
    private updateCart;
    addToCart(customerId: string, restaurantId: string, productId: string, quantity: number, specialInstructions?: string): Promise<CartResponseDto>;
    updateCartItem(customerId: string, restaurantId: string, productId: string, quantity: number, specialInstructions?: string): Promise<CartResponseDto>;
    removeFromCart(customerId: string, restaurantId: string, productId: string): Promise<CartResponseDto>;
    clearCart(customerId: string, restaurantId: string): Promise<CartResponseDto>;
    setOrderType(customerId: string, restaurantId: string, orderType: 'DINE_IN' | 'DELIVERY' | 'TAKEAWAY', tableNumber?: number, deliveryAddress?: {
        street: string;
        city: string;
        postalCode: string;
        phoneNumber: string;
        deliveryInstructions?: string;
        coordinates?: {
            lat: number;
            lng: number;
        };
    }, takeawayPhone?: string, takeawayName?: string): Promise<CartResponseDto>;
}
