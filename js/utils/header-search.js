import productApi from '../api/productApi';
import { handleFilterChange } from '../pages/search';
import { debounce, renderProductSearch } from './constains';
import { renderPagination } from './pagination';

$('.header-input').on(
  'input',
  debounce(async (e) => {
    const value = e.target.value;
    if (!value) {
      $('.search-suggest').css('display', 'none');
      return;
    }

    try {
      const { data } = await productApi.getAll({ search: value });
      $('.search-suggest').css('display', 'block');

      if (data.length <= 0) {
        $('.search-suggest').html('<h1>Không tìm thấy tên sản phẩm</h1>');
        return;
      }

      const searchHTML = data.map(
        (search) => `
          <li class="search-suggest_item">
            <a href="/product-detail.html?id=${search['ma_san_pham']}" class="search-suggest_item-link">
              <i class="fa-solid fa-magnifying-glass"></i>
              <span>${search['ten_san_pham']}</span>
            </a>
          </li>
        `
      );

      $('.search-suggest').html(searchHTML);
    } catch (error) {
      console.log(error.message);
    }
  })
);

$('.header-input').blur(() => {
  $('.search-suggest').css({
    display: 'none',
  });
});

export async function handleSearch(e) {
  if (e.keyCode !== 13) return;

  const value = e.target.value;
  const url = new URL(window.location);

  if (!value) {
    url.searchParams.delete('name');
    history.pushState({}, '', url);
    try {
      const { data, pagination } = await productApi.getAllWithParams(url.searchParams);

      renderProductSearch(data);
      renderPagination(pagination);
    } catch (error) {
      console.log(error.message);
    }
  } else {
    $('.search-suggest').css('display', 'none');
    e.target.value = '';
    handleFilterChange('name', value);
  }
}

$('.header-input').keypress(handleSearch);

$('.btn-header').click(async () => {
  const value = $('.header-input').val();

  const url = new URL(window.location);

  if (!value) {
    url.searchParams.delete('name');
    history.pushState({}, '', url);
    try {
      const { data, pagination } = await productApi.getAllWithParams(url.searchParams);

      renderProductSearch(data);
      renderPagination(pagination);
    } catch (error) {
      console.log(error.message);
    }
  } else {
    $('.search-suggest').css('display', 'none');
    $('.header-input').val('');
    handleFilterChange('name', value);
  }
});

$('.action-bars').click(() => {
  if ($('.action-bars').hasClass('active')) {
    $('.action-bars').removeClass('active');
    $('.overlay').removeClass('active');
    $('.sidebar').removeClass('active');
    return;
  }

  $('.action-bars').addClass('active');
  $('.overlay').addClass('active');
  $('.sidebar').addClass('active');
});

$('.overlay').click(() => {
  if ($('.action-bars').hasClass('active')) {
    $('.action-bars').removeClass('active');
    $('.overlay').removeClass('active');
    $('.sidebar').removeClass('active');
    return;
  }

  $('.action-bars').addClass('active');
  $('.overlay').addClass('active');
  $('.sidebar').addClass('active');
});
