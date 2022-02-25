import { from, interval, Observable, of, Subject } from "rxjs";
import { mapTo, pipe, timeout, shareReplay, share, publish, refCount, publishReplay } from "rxjs/operators";

//const _dbInitialized$$ = interval(1000);
//const dbInitialized$ = _dbInitialized$$
//  .pipe(timeout(2000), publishReplay(), refCount());

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