import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { AIService } from './ai.service';
import { DishesService } from './dishes.service';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';

/**
 * CONTROLLER: DishesController
 * Controllers are responsible for handling incoming REQUESTS and returning RESPONSES.
 * The '@Controller('dishes')' decorator tells Nest that this class handles any request starting with /dishes.
 */
@Controller('dishes')
export class DishesController {
  /**
   * We 'inject' the service here. This is called Dependency Injection.
   * Nest handles creating the service for us.
   */
  constructor(
    private readonly dishesService: DishesService,
    private readonly aiService: AIService,
  ) {}

  /**
   * Only Chefs can generate AI descriptions.
   */
  @Post('generate-description')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CHEF)
  async generateDescription(@Body('name') name: string) {
    return this.aiService.generateDescription(name);
  }

  /**
   * POST /dishes
   * Only Chefs can create new dishes.
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CHEF)
  create(@Body() createDishDto: CreateDishDto, @CurrentUser() user: any) {
    return this.dishesService.create(createDishDto, user);
  }

  /**
   * GET /dishes
   * Both Chefs and Customers can view the menu.
   */
  @Get()
  findAll() {
    return this.dishesService.findAll();
  }

  /**
   * GET /dishes/:id
   * Both Chefs and Customers can view a single dish.
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.dishesService.findOne(id);
  }

  /**
   * PATCH /dishes/:id
   * Only Chefs can update dish details.
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CHEF)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDishDto: UpdateDishDto,
    @CurrentUser() user: any,
  ) {
    return this.dishesService.update(id, updateDishDto, user);
  }

  /**
   * DELETE /dishes/:id
   * Only Chefs can delete dishes.
   */
  /**
   * WEBHOOK: Used by AWS Lambda
   * This endpoint is called automatically when a new image is uploaded to S3.
   */
  @Patch('webhook/update-image')
  async updateImageWebhook(
    @Body() body: { dishId: number; imageUrl: string; secret: string },
  ) {
    // In a real app, I need to verify the 'secret' to ensure only my Lambda can call this
    if (body.secret !== process.env.LAMBDA_SECRET) {
      throw new UnauthorizedException();
    }
    return this.dishesService.updateImageUrl(body.dishId, body.imageUrl);
  }
}
