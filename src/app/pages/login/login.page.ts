import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, RouterModule],
})
export class LoginPage {
  form: FormGroup;
  mostrandoPass = false;
  cargando = false;
  returnUrl = '/catalogo';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private alertCtrl: AlertController
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    const ret = this.route.snapshot.queryParamMap.get('returnUrl');
    if (ret) this.returnUrl = ret;
  }

  togglePass() {
    this.mostrandoPass = !this.mostrandoPass;
  }

  async login() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.cargando = true;
    const { email, password } = this.form.value;
    const res = await this.auth.signIn(email, password);
    this.cargando = false;

    if (!res.success) {
      const a = await this.alertCtrl.create({
        header: 'Error',
        message: res.error || 'No se pudo iniciar sesión',
        buttons: ['Aceptar'],
      });
      await a.present();
      return;
    }

    // Si no se redirigió por rol en AuthService, vuelve al returnUrl
    this.router.navigateByUrl(this.returnUrl, { replaceUrl: true });
  }

  irRegistro() {
    this.router.navigate(['/registro']);
  }

  irCatalogo() {
    this.router.navigate(['/catalogo']);
  }
}