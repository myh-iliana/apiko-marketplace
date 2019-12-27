import { types as t } from 'mobx-state-tree';

export function AsyncModel(thunk, auto = true) {
  const model = t
    .model({
      isLoading: false,
      isError: false,
      errorMsg: t.maybeNull(t.string),
    })
    .actions((store) => ({
      start() {
        store.isLoading = true;
        store.isError = false;
        store.errorMsg = null;
      },

      finish() {
        store.isLoading = false;
      },

      error(err) {
        store.isError = true;
        if (err.response) {
          store.errorMsg = err.response.data.error;
        }
      },

      run(...args) {
        const promise = thunk(...args)(store);

        if (auto) {
          return store._auto(promise);
        }

        return promise;
      },

      async _auto(promise) {
        try {
          store.start();
          await promise;
        } catch (err) {
          store.error(err);
        } finally {
          store.finish();
        }
      },
    }));

  return t.optional(model, {});
}