import { ConnectableObservable, from, interval, MonoTypeOperatorFunction, Observable, of, Subject, Subscription, throwError } from "rxjs";
import { mapTo, delay, map, filter, take, switchMap, last, timeout, shareReplay, share, publish, refCount, publishReplay } from "rxjs/operators";

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

if (false) {
  const waitUntilComplete = function<T>(signal: Observable<any>) {
    //console.log('returning new observable...')
    return (source: ConnectableObservable<T>) => new ConnectableObservable<T>(subscriber => {
      //console.log('Subscribed to waiting observable!')
      signal.subscribe({
        complete: () => {
          //console.log('inner observable completed!');
          source.subscribe(subscriber);
        },
        error: err => {
          //console.log('Waited, but error');
          subscriber.error(err);
        }
      });
    });
  }
  
  const delayedObservable = (id: string) => new Observable(subscriber => {
    console.log(`[${id}] Subscribed to delayed observable!`);
    subscriber.next();
    subscriber.complete();
  });
  
  setTimeout(() => console.log('tick 1'), 1000);
  setTimeout(() => console.log('tick 2'), 2000);
  
  // Is error from waitUntilComplete observable passed on?
  delayedObservable('1')
    .pipe(
      waitUntilComplete(
        interval(100)
        .pipe(filter(v => v > 11), switchMap(_ => throwError('ERR')))
      )
    )
    .subscribe({next: r => console.log('r1', r), error: err => console.error('1 got error', err)});
  
  // Is the subscription to delayedObservable really waiting for waitUntilComplete?
  delayedObservable('2')
    .pipe(
      waitUntilComplete(
        interval(1000).pipe(take(2))
      )
    )
    .subscribe({next: r => console.log('r2', r), error: err => console.error('2 got error', err)});
  
  // Is the subscription to delayedObservable skipped, if the outer subscription is cancelled while waiting?
  const subscription3 = delayedObservable('3')
    .pipe(
      waitUntilComplete(
        interval(1000).pipe(take(2))
      )
    )
    .subscribe({next: r => console.log('r3', r), error: err => console.error('3 got error', err)});
  
    setTimeout(() => subscription3.unsubscribe(), 1000);
}

