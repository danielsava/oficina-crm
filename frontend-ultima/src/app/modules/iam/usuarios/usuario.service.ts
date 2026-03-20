import { Injectable, signal } from '@angular/core';
import { Usuario } from './usuario.model';

@Injectable({
    providedIn: 'root'
})
export class UsuarioService {

    private readonly initialUsers: Usuario[] = [
        {
            id: 1,
            name: 'Brook Simmons',
            login: 'brook.simmons',
            email: 'brook@empresa.com',
            avatar: '/demo/images/avatar/avatar-f-3.png',
            status: 'Active'
        },
        {
            id: 2,
            name: 'Dianne Russell',
            login: 'dianne.russell',
            email: 'dianne@empresa.com',
            avatar: '/demo/images/avatar/avatar-f-5.png',
            status: 'Deactive'
        },
        {
            id: 3,
            name: 'Amy Elsner',
            login: 'amy.elsner',
            email: 'amy@empresa.com',
            avatar: '/demo/images/avatar/amyelsner.png',
            status: 'Active'
        },
        {
            id: 4,
            name: 'Guy Hawkins',
            login: 'guy.hawkins',
            email: 'guy@empresa.com',
            avatar: '/demo/images/avatar/avatar-m-2.png',
            status: 'Active'
        },
        {
            id: 5,
            name: 'Darrell Steward',
            login: 'darrell.steward',
            email: 'darrell@empresa.com',
            avatar: '/demo/images/avatar/avatar-m-4.png',
            status: 'Deactive'
        },
        {
            id: 6,
            name: 'Onyama Limba',
            login: 'onyama.limba',
            email: 'onyama@empresa.com',
            avatar: '/demo/images/avatar/onyamalimba.png',
            status: 'Deactive'
        },
        {
            id: 7,
            name: 'Arlene McCoy',
            login: 'arlene.mccoy',
            email: 'arlene@empresa.com',
            avatar: '/demo/images/avatar/avatar-f-7.png',
            status: 'Deactive'
        },
        {
            id: 8,
            name: 'Annette Black',
            login: 'annette.black',
            email: 'annette@empresa.com',
            avatar: '/demo/images/avatar/annafali.png',
            status: 'Active'
        }
    ];

    private usersSignal = signal<Usuario[]>(this.initialUsers);

    // Readonly signal for components to consume
    public users = this.usersSignal.asReadonly();

    public getUserById(id: number): Usuario | undefined {
        return this.usersSignal().find(u => u.id === id);
    }

    public addUser(user: Omit<Usuario, 'id'>) {
        const id = Math.max(0, ...this.usersSignal().map(u => u.id)) + 1;
        this.usersSignal.update(users => [...users, { ...user, id }]);
    }

    public updateUser(updatedUser: Usuario) {
        this.usersSignal.update(users =>
            users.map(u => u.id === updatedUser.id ? updatedUser : u)
        );
        // Refresh the signal array reference explicitly
        this.usersSignal.set([...this.usersSignal()]);
    }

    public deleteUser(id: number) {
        this.usersSignal.update(users => users.filter(u => u.id !== id));
    }
}
