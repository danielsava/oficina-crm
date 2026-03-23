import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from './usuario.model';

@Injectable({
    providedIn: 'root'
})
export class UsuarioService {

    private http = inject(HttpClient);

    private apiUrl = 'http://localhost:8080/api/usuarios';

    private usersSignal = signal<Usuario[]>([]);

    // Readonly signal for components to consume
    public users = this.usersSignal.asReadonly();

    public loadUsers(): void {
        this.http.get<Usuario[]>(this.apiUrl).subscribe({
            next: (data) => this.usersSignal.set(data),
            error: (err) => console.error('Erro ao buscar usuários', err)
        });
    }

    public getUserById(id: number): Observable<Usuario> {
        return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
    }

    public addUser(user: Omit<Usuario, 'id'>): Observable<Usuario> {
        return this.http.post<Usuario>(this.apiUrl, user);
    }

    public updateUser(user: Usuario): Observable<Usuario> {
        return this.http.put<Usuario>(`${this.apiUrl}/${user.id}`, user);
    }

    public deleteUser(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

}
