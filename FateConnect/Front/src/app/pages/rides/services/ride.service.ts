import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { RideFilter } from '../models/ride-filter.model';
import { Ride } from '../models/ride.model';

@Injectable({ providedIn: 'root' })
export class RideService {
  private readonly http = inject(HttpClient);
  private readonly rideApiUrl = `${environment.rideApiUrl}/caronas`;

  listRides(filters?: RideFilter): Observable<Ride[]> {
    let params = new HttpParams();

    if (filters) {
      if (filters.destination) {
        params = params.set('Destino', filters.destination);
      }

      if (filters.departureDate) {
        params = params.set('DataPartida', filters.departureDate);
      }

      if (filters.departureTime) {
        params = params.set('HoraPartida', filters.departureTime);
      }

      if (filters.rideType) {
        params = params.set('TipoCarona', filters.rideType);
      }
    }

    return this.http.get<Ride[]>(this.rideApiUrl, { params });
  }

  deleteRide(id: number): Observable<void> {
    return this.http.delete<void>(`${this.rideApiUrl}/${id}`);
  }
}
