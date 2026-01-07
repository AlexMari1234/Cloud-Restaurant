import { CartService } from '../services/cart.service';
import { AddToCartDto, UpdateCartItemDto, SetOrderTypeDto, CartResponseDto } from '@rm/common';
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
    getCart(req: any, restaurantId: string): Promise<CartResponseDto>;
    addToCart(req: any, restaurantId: string, productId: string, addToCartDto: AddToCartDto): Promise<CartResponseDto>;
    updateCartItem(req: any, restaurantId: string, productId: string, updateCartItemDto: UpdateCartItemDto): Promise<CartResponseDto>;
    removeFromCart(req: any, restaurantId: string, productId: string): Promise<CartResponseDto>;
    clearCart(req: any, restaurantId: string): Promise<CartResponseDto>;
    setOrderType(req: any, restaurantId: string, setOrderTypeDto: SetOrderTypeDto): Promise<CartResponseDto>;
}
