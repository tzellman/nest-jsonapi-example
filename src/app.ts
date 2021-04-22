import * as bodyParser from "body-parser";
import * as faker from "faker";
import * as uuid from "uuid";
import { NestFactory } from "@nestjs/core";
import {
    Inject,
    Logger,
    MiddlewareConsumer,
    Module,
    NestModule,
    OnModuleInit,
} from "@nestjs/common";
import {
    JSONAPI_MODULE_SERVICE,
    JsonapiMiddleware,
    JsonapiModule,
    JsonapiService,
    SchemaBuilder,
} from "nest-jsonapi";
import { SequelizeModule } from "@nestjs/sequelize";
import Photo from "./schemas/photo";
import PhotosController from "./photos.controller";
import { RESOURCE_PHOTOS } from "./constants";

@Module({
    imports: [
        SequelizeModule.forRootAsync({
            useFactory: () => ({
                dialect: "sqlite",
                database: ":memory:",
                synchronize: true,
                autoLoadModels: true,
                logging: false,
            }),
        }),
        SequelizeModule.forFeature([Photo]),
        JsonapiModule.forRoot({ mountPoint: "/api" }),
    ],
    controllers: [PhotosController],
})
export class AppModule implements NestModule, OnModuleInit {
    constructor(
        @Inject(JSONAPI_MODULE_SERVICE)
        private readonly jsonapiService: JsonapiService
    ) {
    }

    public configure(consumer: MiddlewareConsumer): void {
        consumer.apply(JsonapiMiddleware).forRoutes(PhotosController);
    }

    public async onModuleInit(): Promise<void> {
        let photosSchemaBuilder = new SchemaBuilder<Photo>(RESOURCE_PHOTOS);
        photosSchemaBuilder.dataBuilder.untransformAttributes({
            deny: ["createdAt", "updatedAt"],
        });
        this.jsonapiService.register(photosSchemaBuilder);

        // seed the database with some data
        for (let i = 0, numPhotos = faker.random.number(100); i < numPhotos; ++i) {
            const photo = new Photo();
            photo.url = faker.image.imageUrl();
            photo.title = faker.random.words();
            photo.id = uuid.v4();
            await photo.save();
        }
    }
}

const bootstrap = async (): Promise<void> => {
    const logger = new Logger('Bootstrap');
    const app = await NestFactory.create(AppModule);
    app.use(bodyParser.urlencoded({ extended: true }));
    app.setGlobalPrefix('/api');

    app.enableShutdownHooks();
    const port = 1337;
    await app.listen(port);
    logger.log(`API is up and running on port ${port}`);
};

bootstrap();
