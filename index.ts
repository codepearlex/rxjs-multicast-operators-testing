import { from, interval, Observable, of, Subject, throwError } from "rxjs";
import { mapTo, pipe, map, take, switchMap, last, timeout, shareReplay, share, publish, refCount, publishReplay } from "rxjs/operators";

//const _dbInitialized$$ = interval(1000);
//const dbInitialized$ = _dbInitialized$$
//  .pipe(timeout(2000), publishReplay(), refCount());
if (false) {
  const _lateComplete$ = new Observable(subscriber => {
    console.log('Executed!');
    setTimeout(() => {
      console.log('now completing the observable!');
      subscriber.complete();
    }, 2000)
  })
  
  const _lateError$ = new Observable(subscriber => {
    console.log('Executed!');
    setTimeout(() => {
      console.log('now throwing error on the observable!');
      subscriber.error();
    }, 2000)
  })
  
  const dbInitialized$ = _lateComplete$
    .pipe(publish(), refCount());
  
    // RxJS v6.6.7 (~6.6.0)
    // ------------------------
    // shareReplay          on complete Observable: All three get the same Observable, even the late subscriber
    // shareReplay          on error    Observable: First two subscribers share the Observable. Late subscriber
    //                                              triggers a new execution!
    // publish(), refCount  on complete Observable: All three get the same Observable, even the late subscriber
    // publish(), refCount  on error    Observable: All three get the same Observable, even the late subscriber
  
  dbInitialized$.subscribe({
    next: v => console.log('next 1', v),
    complete: () => console.log('complete 1'),
    error: () => console.log('error 1')
  })
  
  setTimeout(() => {
    console.log('subscribing again (2) (instant complete expected)')
    dbInitialized$.subscribe({
      next: v => console.log('next 2', v),
      complete: () => console.log('complete 2'),
      error: () => console.log('error 2')
    })
  }, 1000)
  
  setTimeout(() => {
    console.log('subscribing again (3) (instant complete expected)')
    dbInitialized$.subscribe({
      next: v => console.log('next 3', v),
      complete: () => console.log('complete 3'),
      error: () => console.log('error 3')
    })
  }, 2100)
}

const waitUntilComplete = function<T>(signal: Observable<any>) {
  return (source: Observable<T>) => new Observable<T>(subscriber => {
    signal.subscribe({
      complete: () => source.subscribe(subscriber),
      error: err => subscriber.error(err)
    });
  });
}


const delayedObservable = new Observable(subscriber => {
  console.log('Subscribed to delayed observable!');
  subscriber.next();
  subscriber.complete();
});

setTimeout(() => console.log('tick 1'), 1000);
setTimeout(() => console.log('tick 2'), 2000);

delayedObservable
  .pipe(
    waitUntilComplete(interval(1000)
      .pipe(
        map(v => throwError('new error'))
      )
    )
  )
  .subscribe({next: r => console.log('r', r), error: err => console.error('got error', err)});