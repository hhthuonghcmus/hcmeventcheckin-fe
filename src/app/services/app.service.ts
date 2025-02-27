import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  public isLoading$ = new BehaviorSubject<boolean>(false);

  constructor() {}

  
}
