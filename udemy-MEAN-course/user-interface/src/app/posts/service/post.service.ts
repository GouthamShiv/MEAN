import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Post } from '@src/app/posts/post.model';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{posts: Post[], totalPosts: number}>();

  constructor(private http: HttpClient, private router: Router) {}

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  getPosts(pageSize: number, currentPage: number) {
    // return [...this.posts];
    console.log('In getPosts() from post.service.ts');
    const queryParams = `?pageSize=${pageSize}&page=${currentPage}`;
    this.http
      .get<{ message: string; posts: any, totalPosts: number }>('http://localhost:3000/api/posts' + queryParams, this.httpOptions)
      .pipe(
        map(postsData => {
          return {
            posts: postsData.posts.map((post: any) => {
              return {
                title: post.title,
                content: post.content,
                id: post._id,
                imagePath: post.imagePath,
                creator: post.creator,
              };
            }),
            totalPosts: postsData.totalPosts,
          };
        })
      )
      .subscribe(transformedPosts => {
        this.posts = transformedPosts.posts;
        this.postsUpdated.next({ posts: [...this.posts], totalPosts: transformedPosts .totalPosts});
      });
  }

  getPostAddedListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(postTitle: string, postContent: string, image: File) {
    // const post: Post = { id: '', title: postTitle, content: postContent };
    const postData = new FormData();
    postData.append('title', postTitle);
    postData.append('content', postContent);
    postData.append('image', image, postTitle);
    this.http
      .post<{ message: string; post: Post }>('http://localhost:3000/api/posts', postData)
      // .subscribe(responseData => {
      .subscribe(() => {
        // const post: Post = { id: responseData.post.id, title: postTitle, content: postContent, imagePath: responseData.post.imagePath };
        // // console.log(responseData.message);
        // // post.id = responseData.postId;
        // this.posts.push(post);
        // this.postsUpdated.next([...this.posts]);
        this.redirectToHome();
      });
  }

  deletePost(postId: string) {
    return this.http.delete('http://localhost:3000/api/posts/' + postId, this.httpOptions);
      // .subscribe(() => {
      //   const updatedPosts = this.posts.filter(post => post.id !== postId);
      //   this.posts = updatedPosts;
      //   console.log(`Post with ID ${postId} is successfully deleted`);
      //   this.postsUpdated.next([...this.posts]);
      // });
  }

  getPost(id: string) {
    // return { ...this.posts.find(p => p.id === id) };
    return this.http.get<{
      message: string;
      posts: { _id: string; title: string; content: string; imagePath: string; creator: string };
    }>('http://localhost:3000/api/posts/' + id, this.httpOptions);
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;
    if (typeof (image) === 'object') {
      postData = new FormData();
      postData.append('id', id)
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      postData = {
        id: id,
        title: title,
        content: content,
        imagePath: image as string,
        creator: null,
      };
    }
    this.http.put('http://localhost:3000/api/posts/' + id, postData, this.httpOptions).subscribe(() => {
      // result => {
      // const updatedPosts = [...this.posts];
      // const oldPostIndex = updatedPosts.findIndex(p => p.id === id);
      // const post: Post = {
      //   id: id,
      //   title: title,
      //   content: content,
      //   imagePath: ''//result.imagePath,
      // };
      // updatedPosts[oldPostIndex] = post;
      // this.posts = updatedPosts;
      // this.postsUpdated.next([...this.posts]);
      this.redirectToHome();
    });
  }

  redirectToHome() {
    this.router.navigate(['/']);
  }
}
