import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * DECORATOR: CurrentUser
 * Use this in your controllers to easily get the authenticated user's data.
 * Example: create(@CurrentUser() user: any, @Body() dto: CreateDishDto)
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
