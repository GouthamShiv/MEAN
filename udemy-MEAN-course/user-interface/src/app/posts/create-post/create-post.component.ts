import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
// import { Post } from '@src/app/posts/post.model';
import { PostService } from '@src/app/posts/service/post.service';
import { Post } from '@src/app/posts/post.model';
import { mimeType } from '@src/app/posts/create-post/mime-type.validator';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css'],
})
export class CreatePostComponent implements OnInit {
  // @Output() postCreated = new EventEmitter<Post>();
  mode = 'create';
  private postId = '';
  public post!: Post;
  isLoading = false;
  postForm: FormGroup;
  imagePreview: string;

  constructor(public postService: PostService, public route: ActivatedRoute) {}

  ngOnInit(): void {
    this.postForm = new FormGroup({
      postTitle: new FormControl(null, { validators: [Validators.required, Validators.minLength(4)] }),
      postContent: new FormControl(null, { validators: [Validators.required] }),
      postImage: new FormControl(null, { validators: [Validators.required], asyncValidators: [mimeType] })
    });

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId') || '';
        this.isLoading = true;
        this.postService.getPost(String(this.postId)).subscribe(postData => {
          this.isLoading = false;
          this.post = {
            id: postData.posts._id,
            title: postData.posts.title,
            content: postData.posts.content,
            imagePath: '',
          };
          this.postForm.setValue({
            postTitle: this.post.title,
            postContent: this.post.content,
            postImage: this.post.imagePath,
          });
        });
      } else {
        this.mode = 'create';
        this.postId = '';
      }
    });
  }

  onSavePost() {
    // console.log('postForm.value.postTitle :: ' + this.post.title);
    // console.log('postForm.value.postContent :: ' + this.post.content);
    if (this.postForm.invalid) return;

    this.isLoading = true;
    if (this.mode === 'create') {
      this.postService.addPost(this.postForm.value.postTitle, this.postForm.value.postContent, this.postForm.value.postImage);
    } else {
      this.postService.updatePost(
        this.postId,
        this.postForm.value.postTitle,
        this.postForm.value.postContent,
        this.postForm.value.postImage
      );
    }

    this.postForm.reset();
    // this.postForm.resetForm();
    // const post: Post = {
    //   title: postForm.value.postTitle,
    //   content: postForm.value.postContent
    // };
    // this.postCreated.emit(post);
    // this.postService.addPost(post.title, post.content);
  }

  onImageSelect(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.postForm.patchValue({ postImage: file });
    this.postForm.get('postImage').updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
}