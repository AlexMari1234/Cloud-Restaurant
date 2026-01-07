import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument, CartItem } from '../schemas/cart.schema';
import { Product as ProductSchema, ProductDocument } from '../../menu/schemas/product.schema';
import { CartResponseDto } from '@rm/common';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name)
    private readonly cartModel: Model<CartDocument>,
    @InjectModel(ProductSchema.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  private async getProduct(restaurantId: string, productId: string): Promise<ProductDocument> {
    const product = await this.productModel.findOne({
      _id: new Types.ObjectId(productId),
      restaurantId: new Types.ObjectId(restaurantId),
    });
    
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    
    return product;
  }

  private async calculateTotal(items: CartItem[]): Promise<number> {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  private toResponseDto(cart: CartDocument): CartResponseDto {
    return {
      _id: (cart._id as any).toString(),
      customerId: cart.customerId.toString(),
      restaurantId: cart.restaurantId.toString(),
      items: cart.items.map(item => ({
        productId: item.productId.toString(),
        quantity: item.quantity,
        price: item.price,
        specialInstructions: item.specialInstructions,
      })),
      totalAmount: cart.totalAmount,
      orderType: cart.orderType,
      tableNumber: cart.tableNumber,
      deliveryAddress: cart.deliveryAddress,
      takeawayPhone: cart.takeawayPhone,
      takeawayName: cart.takeawayName,
      lastUpdated: cart.lastUpdated,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }

  async getCart(customerId: string, restaurantId: string): Promise<CartResponseDto> {
    const cart = await this.cartModel.findOne({
      customerId: new Types.ObjectId(customerId),
      restaurantId: new Types.ObjectId(restaurantId),
    });

    if (!cart) {
      // Create empty cart if it doesn't exist
      const newCart = await this.cartModel.create({
        customerId: new Types.ObjectId(customerId),
        restaurantId: new Types.ObjectId(restaurantId),
        items: [],
        totalAmount: 0,
      });
      return this.toResponseDto(newCart);
    }

    return this.toResponseDto(cart);
  }

  private async updateCart(cart: CartDocument): Promise<CartDocument> {
    const updated = await this.cartModel.findByIdAndUpdate(
      cart._id,
      cart,
      { new: true }
    );
    if (!updated) {
      throw new NotFoundException('Cart not found');
    }
    return updated;
  }

  async addToCart(
    customerId: string,
    restaurantId: string,
    productId: string,
    quantity: number,
    specialInstructions?: string,
  ): Promise<CartResponseDto> {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    const product = await this.getProduct(restaurantId, productId);
    if (product.status !== 'active') {
      throw new BadRequestException('Product is not available');
    }

    const cart = await this.cartModel.findOne({
      customerId: new Types.ObjectId(customerId),
      restaurantId: new Types.ObjectId(restaurantId),
    });

    let cartDoc: CartDocument;
    if (!cart) {
      cartDoc = await this.cartModel.create({
        customerId: new Types.ObjectId(customerId),
        restaurantId: new Types.ObjectId(restaurantId),
        items: [],
        totalAmount: 0,
      });
    } else {
      cartDoc = cart;
    }

    // Check if product already exists in cart
    const existingItemIndex = cartDoc.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update existing item
      cartDoc.items[existingItemIndex].quantity += quantity;
      cartDoc.items[existingItemIndex].price = product.price;
      if (specialInstructions) {
        cartDoc.items[existingItemIndex].specialInstructions = specialInstructions;
      }
    } else {
      // Add new item
      cartDoc.items.push({
        productId: new Types.ObjectId(productId),
        quantity,
        price: product.price,
        specialInstructions,
      });
    }

    cartDoc.totalAmount = await this.calculateTotal(cartDoc.items);
    cartDoc.lastUpdated = new Date();

    const updatedCart = await this.updateCart(cartDoc);
    return this.toResponseDto(updatedCart);
  }

  async updateCartItem(
    customerId: string,
    restaurantId: string,
    productId: string,
    quantity: number,
    specialInstructions?: string,
  ): Promise<CartResponseDto> {
    if (quantity < 0) {
      throw new BadRequestException('Quantity cannot be negative');
    }

    const cart = await this.cartModel.findOne({
      customerId: new Types.ObjectId(customerId),
      restaurantId: new Types.ObjectId(restaurantId),
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      throw new NotFoundException('Item not found in cart');
    }

    if (quantity === 0) {
      // Remove item if quantity is 0
      cart.items.splice(itemIndex, 1);
    } else {
      // Update item
      cart.items[itemIndex].quantity = quantity;
      if (specialInstructions !== undefined) {
        cart.items[itemIndex].specialInstructions = specialInstructions;
      }
    }

    cart.totalAmount = await this.calculateTotal(cart.items);
    cart.lastUpdated = new Date();

    const updatedCart = await this.updateCart(cart);
    return this.toResponseDto(updatedCart);
  }

  async removeFromCart(
    customerId: string,
    restaurantId: string,
    productId: string,
  ): Promise<CartResponseDto> {
    const cart = await this.cartModel.findOne({
      customerId: new Types.ObjectId(customerId),
      restaurantId: new Types.ObjectId(restaurantId),
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      throw new NotFoundException('Item not found in cart');
    }

    cart.items.splice(itemIndex, 1);
    cart.totalAmount = await this.calculateTotal(cart.items);
    cart.lastUpdated = new Date();

    const updatedCart = await this.updateCart(cart);
    return this.toResponseDto(updatedCart);
  }

  async clearCart(customerId: string, restaurantId: string): Promise<CartResponseDto> {
    const cart = await this.cartModel.findOne({
      customerId: new Types.ObjectId(customerId),
      restaurantId: new Types.ObjectId(restaurantId),
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    cart.items = [];
    cart.totalAmount = 0;
    cart.lastUpdated = new Date();
    
    const updatedCart = await this.updateCart(cart);
    return this.toResponseDto(updatedCart);
  }

  async setOrderType(
    customerId: string,
    restaurantId: string,
    orderType: 'DINE_IN' | 'DELIVERY' | 'TAKEAWAY',
    tableNumber?: number,
    deliveryAddress?: {
      street: string;
      city: string;
      postalCode: string;
      phoneNumber: string;
      deliveryInstructions?: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
    },
    takeawayPhone?: string,
    takeawayName?: string,
  ): Promise<CartResponseDto> {
    const cart = await this.cartModel.findOne({
      customerId: new Types.ObjectId(customerId),
      restaurantId: new Types.ObjectId(restaurantId),
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    if (orderType === 'DINE_IN' && !tableNumber) {
      throw new BadRequestException('Table number is required for dine-in orders');
    }

    if (orderType === 'DELIVERY' && !deliveryAddress) {
      throw new BadRequestException('Delivery address is required for delivery orders');
    }

    if (orderType === 'TAKEAWAY' && !takeawayPhone) {
      throw new BadRequestException('Phone number is required for takeaway orders');
    }

    // Build the update object with $set and $unset operations
    const updateOperation: any = {
      $set: {
        orderType: orderType,
        lastUpdated: new Date(),
      },
      $unset: {}
    };

    // Always unset all order type specific fields first
    updateOperation.$unset.tableNumber = '';
    updateOperation.$unset.deliveryAddress = '';
    updateOperation.$unset.takeawayPhone = '';
    updateOperation.$unset.takeawayName = '';

    // Then set only the relevant fields based on order type
    if (orderType === 'DINE_IN') {
      updateOperation.$set.tableNumber = tableNumber;
      delete updateOperation.$unset.tableNumber;
    } else if (orderType === 'DELIVERY') {
      updateOperation.$set.deliveryAddress = deliveryAddress;
      delete updateOperation.$unset.deliveryAddress;
    } else if (orderType === 'TAKEAWAY') {
      updateOperation.$set.takeawayPhone = takeawayPhone;
      updateOperation.$set.takeawayName = takeawayName;
      delete updateOperation.$unset.takeawayPhone;
      delete updateOperation.$unset.takeawayName;
    }

    // Remove $unset if it's empty
    if (Object.keys(updateOperation.$unset).length === 0) {
      delete updateOperation.$unset;
    }

    // Update the cart using findOneAndUpdate with the update operation
    const updatedCart = await this.cartModel.findOneAndUpdate(
      {
        customerId: new Types.ObjectId(customerId),
        restaurantId: new Types.ObjectId(restaurantId),
      },
      updateOperation,
      { new: true }
    );

    if (!updatedCart) {
      throw new NotFoundException('Cart not found');
    }

    return this.toResponseDto(updatedCart);
  }
} 