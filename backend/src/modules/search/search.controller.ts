import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SearchService } from './search.service';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(@Query('q') query: string) {
    if (!query || query.trim().length < 2) {
      return { dossiers: [], clients: [], vehicles: [] };
    }
    return this.searchService.globalSearch(query.trim());
  }
}
