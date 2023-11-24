import productApi from '../api/productApi';
import { debounce } from './constains';

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

$('.header-input').keypress((e) => {
  if (e.keyCode !== 13) return;

  const value = e.target.value;

  if (value) {
    window.location.href = '/search.html?name=' + value;
  }
});

$('.btn-header').click(() => {
  const value = $('.header-input').val();

  if (value) {
    window.location.href = '/search.html?name=' + value;
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
