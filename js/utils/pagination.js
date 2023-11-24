import { handleFilterChange } from '../pages/search';

function handlePrevClick(e) {
  const ulPagination = $('.pagination');
  if (!ulPagination) return;

  const page = Number(ulPagination.attr('page')) || 1;
  if (page <= 1) return;

  handleFilterChange('_page', page - 1);
}

function handleLiClick(e) {
  const ulPagination = $('.pagination');
  if (!ulPagination) return;

  const page = Number(e.target.dataset.page);

  const currentPage = Number(ulPagination.attr('page')) || 1;
  if (page === currentPage) return;

  handleFilterChange('_page', page);
}

function handleNextClick(e) {
  e.preventDefault();
  const ulPagination = $('.pagination');
  if (!ulPagination) return;

  const page = Number(ulPagination.attr('page')) || 1;
  const totalPages = Number(ulPagination.attr('total-pages'));
  if (page >= totalPages) return;

  handleFilterChange('_page', page + 1);
}

export function initPagination() {
  //
  const liPagination = $('.pagination li');
  if (!liPagination) return;

  const prevLink = liPagination.first();
  prevLink.click(handlePrevClick);

  const nextLink = liPagination.last();
  nextLink.click(handleNextClick);

  const liClickPagination = $('.pagination li.page-item_click');
  liClickPagination.click(handleLiClick);
}

export function initURL() {
  const url = new URL(window.location);

  if (!url.searchParams.get('_page')) {
    url.searchParams.set('_page', 1);
  }

  if (!url.searchParams.get('_limit')) {
    url.searchParams.set('_limit', 16);
  }

  history.pushState({}, '', url);
}

export function renderPagination(pagination) {
  const ulPagination = $('.pagination');
  if (!pagination || !ulPagination) return;

  const { _page, _limit, _totalRows } = pagination;

  const totalPages = Math.ceil(_totalRows / _limit);

  ulPagination.attr('page', _page);
  ulPagination.attr('total-pages', totalPages);

  ulPagination.html('');

  ulPagination.append(`<li class="page-item">
      <span aria-hidden="true">&laquo;</span>
  </li>`);

  for (let i = 1; i <= totalPages; i++) {
    let active = i === _page ? 'active' : '';
    ulPagination.append(
      `<li class="page-item ${active} page-item_click" data-page="${i}">${i}</li>`
    );
  }

  ulPagination.append(`<li class="page-item">
      <span aria-hidden="true">&raquo;</span>
  </li>`);

  const liPagination = $('.pagination li');

  if (totalPages <= 1) {
    ulPagination.addClass('hidden');
    return;
  }

  ulPagination.removeClass('hidden');

  if (_page <= 1) {
    liPagination.first().addClass('disabled');
  } else {
    liPagination.first().removeClass('disabled');
  }

  if (_page >= totalPages) {
    liPagination.last().addClass('disabled');
  } else {
    liPagination.last().removeClass('disabled');
  }

  initPagination();
}
