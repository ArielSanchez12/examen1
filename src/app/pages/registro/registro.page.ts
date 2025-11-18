import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, RouterModule],
})
export class RegistroPage {
  form: FormGroup;
  cargando = false;
  mostrandoPass = false;
  mostrandoPass2 = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private alertCtrl: AlertController
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm: ['', [Validators.required]],
      terminos: [false, [Validators.requiredTrue]],
    }, { validators: this.passwordsIguales });
  }

  passwordsIguales(group: FormGroup) {
    const p = group.get('password')?.value;
    const c = group.get('confirm')?.value;
    return p === c ? null : { mismatch: true };
  }

  togglePass(which: 1 | 2) {
    if (which === 1) this.mostrandoPass = !this.mostrandoPass;
    else this.mostrandoPass2 = !this.mostrandoPass2;
  }

  async registro() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.cargando = true;
    const { nombre, email, password } = this.form.value;
    const res = await this.auth.signUp(email, password, nombre);
    this.cargando = false;

    if (!res.success) {
      const a = await this.alertCtrl.create({
        header: 'Error',
        message: res.error || 'No se pudo crear la cuenta',
        buttons: ['Aceptar'],
      });
      await a.present();
      return;
    }

    const ok = await this.alertCtrl.create({
      header: 'Cuenta creada',
      message: 'Te registraste como usuario. Inicia sesión para continuar.',
      buttons: [{ text: 'Ir a Iniciar Sesión', handler: () => this.router.navigate(['/login']) }],
    });
    await ok.present();
  }

  irLogin() {
    this.router.navigate(['/login']);
  }
}