import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CartService } from '../services/cart.service';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { 
  AddToCartDto, 
  UpdateCartItemDto, 
  SetOrderTypeDto, 
  CartResponseDto 
} from '@rm/common';

@ApiTags('Cart')
@Controller('cart/:restaurantId')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get cart for current user and restaurant' })
  @ApiResponse({ status: 200, description: 'Returns the cart', type: CartResponseDto })
  async getCart(
    @Req() req,
    @Param('restaurantId') restaurantId: string,
  ): Promise<CartResponseDto> {
    return this.cartService.getCart(req.user._id, restaurantId);
  }

  @Post('products/:productId')
  @ApiOperation({ summary: 'Add product to cart' })
  @ApiResponse({ status: 201, description: 'Product added to cart', type: CartResponseDto })
  async addToCart(
    @Req() req,
    @Param('restaurantId') restaurantId: string,
    @Param('productId') productId: string,
    @Body() addToCartDto: AddToCartDto,
  ): Promise<CartResponseDto> {
    return this.cartService.addToCart(
      req.user._id,
      restaurantId,
      productId,
      addToCartDto.quantity,
      addToCartDto.specialInstructions,
    );
  }

  @Put('products/:productId')
  @ApiOperation({ summary: 'Update cart item' })
  @ApiResponse({ status: 200, description: 'Cart item updated', type: CartResponseDto })
  async updateCartItem(
    @Req() req,
    @Param('restaurantId') restaurantId: string,
    @Param('productId') productId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    return this.cartService.updateCartItem(
      req.user._id,
      restaurantId,
      productId,
      updateCartItemDto.quantity,
      updateCartItemDto.specialInstructions,
    );
  }

  @Delete('products/:productId')
  @ApiOperation({ summary: 'Remove product from cart' })
  @ApiResponse({ status: 200, description: 'Product removed from cart', type: CartResponseDto })
  async removeFromCart(
    @Req() req,
    @Param('restaurantId') restaurantId: string,
    @Param('productId') productId: string,
  ): Promise<CartResponseDto> {
    return this.cartService.removeFromCart(
      req.user._id,
      restaurantId,
      productId,
    );
  }

  @Delete()
  @ApiOperation({ summary: 'Clear cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared', type: CartResponseDto })
  async clearCart(
    @Req() req,
    @Param('restaurantId') restaurantId: string,
  ): Promise<CartResponseDto> {
    return this.cartService.clearCart(req.user._id, restaurantId);
  }

  @Put('order-type')
  @ApiOperation({ summary: 'Set order type and related details' })
  @ApiResponse({ status: 200, description: 'Order type set', type: CartResponseDto })
  async setOrderType(
    @Req() req,
    @Param('restaurantId') restaurantId: string,
    @Body() setOrderTypeDto: SetOrderTypeDto,
  ): Promise<CartResponseDto> {
    return this.cartService.setOrderType(
      req.user._id,
      restaurantId,
      setOrderTypeDto.orderType,
      setOrderTypeDto.tableNumber,
      setOrderTypeDto.deliveryAddress,
      setOrderTypeDto.takeawayPhone,
      setOrderTypeDto.takeawayName,
    );
  }
} 