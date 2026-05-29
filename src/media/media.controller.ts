import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';
import { MediaService } from './media.service';
import { UpdateMediaDto } from './dto/update-media.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { RequiredPermission } from '../auth/decorators/permissions.decorator';

const imageStorage = diskStorage({
  destination: './uploads',
  filename: (_req, file, cb) => {
    cb(null, `${uuid()}-${Date.now()}${extname(file.originalname)}`);
  },
});

const imageFilter = (_req: any, file: Express.Multer.File, cb: any) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestException('Format non supporté. Formats acceptés : jpeg, png, webp, gif'), false);
  }
};

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @RequiredPermission('admin')
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: imageStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  uploadTemporary(
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Aucun fichier envoyé');
    return this.mediaService.saveTemporary(file);
  }

  @RequiredPermission('admin')
  @Post('upload/produit/:productId')
  @UseInterceptors(FileInterceptor('file', {
    storage: imageStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  uploadProduitImage(
    @Param('productId', ParseUUIDPipe) productId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Aucun fichier envoyé');
    return this.mediaService.saveForProduit(file, productId);
  }

  @RequiredPermission('admin')
  @Post('upload/categorie/:categoryId')
  @UseInterceptors(FileInterceptor('file', {
    storage: imageStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  uploadCategorieImage(
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Aucun fichier envoyé');
    return this.mediaService.saveForCategorie(file, categoryId);
  }

  @RequiredPermission('admin')
  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.mediaService.findAll(pagination);
  }

  @RequiredPermission('admin')
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.mediaService.findOne(id);
  }

  @RequiredPermission('admin')
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMediaDto,
  ) {
    return this.mediaService.update(id, dto);
  }

  @RequiredPermission('admin')
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.mediaService.remove(id);
  }
}
