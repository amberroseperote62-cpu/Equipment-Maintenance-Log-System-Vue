import { computed, ref, watch } from "vue";
import { paginate } from "../store";

/**
 * Reusable paging logic (a "composable").
 * Pass a function that returns the full list; get back the current page
 * number and the rows for that page. Used by the Rooms and Users pages.
 */
export function usePagination(getItems) {
  const page = ref(1);
  const result = computed(() => paginate(getItems(), page.value));

  // If the page we're on disappears (e.g. after deleting the last row), step back.
  watch(
    () => result.value.current_page,
    (p) => {
      if (page.value !== p) page.value = p;
    },
  );

  return { page, result };
}
