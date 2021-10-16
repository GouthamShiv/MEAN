import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListPostComponent } from '@src/app/posts/list-post/list-post.component';
import { LoginComponent } from './auth/login/login.component';
import { AuthGuard } from './auth/service/auth.guard';
import { SignupComponent } from './auth/signup/signup.component';
import { CreatePostComponent } from './posts/create-post/create-post.component';

const routes: Routes = [
  { path: '', component: ListPostComponent },
  { path: 'createPost', component: CreatePostComponent, canActivate: [AuthGuard] },
  { path: 'editPost/:postId', component: CreatePostComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule { }
