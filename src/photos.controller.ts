import {
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    Query,
    UseInterceptors,
    UsePipes,
    ValidationPipe,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { JsonapiInterceptor, JsonapiPayload } from "nest-jsonapi";
import Photo from "./schemas/photo";
import { RESOURCE_PHOTOS } from "./constants";
import { IsOptional, IsString } from "class-validator";
import { Op, WhereAttributeHash } from "sequelize";

class FindOptions {
    @IsString()
    @IsOptional()
    public readonly q: string;

    @IsOptional()
    @IsString({ each: true })
    public readonly id: string[];
}

@UseInterceptors(JsonapiInterceptor)
@Controller('photos')
export default class PhotosController {
    constructor(@InjectModel(Photo) private readonly photoModel: Photo & typeof Photo) {
    }

    @UsePipes(new ValidationPipe({ transform: true, transformOptions: { enableImplicitConversion: true } }))
    @JsonapiPayload({ resource: RESOURCE_PHOTOS })
    @Get()
    public async findPhotos(@Query() query: FindOptions): Promise<Photo[]> {
        const where: WhereAttributeHash<Photo> = {};
        if (query.id) {
            where.id = { [Op.in]: query.id };
        }
        if (query.q) {
            where.title = { [Op.contains]: query.q };
        }
        return this.photoModel.findAll({ where });
    }

    @JsonapiPayload()
    @Delete(':id')
    public async deletePhoto(@Param('id') id: string): Promise<void> {
        const photo = await this.photoModel.findByPk(id);
        if (photo) {
            await photo.destroy();
        } else {
            throw new NotFoundException(`Invalid photo id`);
        }
    }
}
