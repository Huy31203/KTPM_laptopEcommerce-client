import brandApi from '../api/brandApi';
import productApi from '../api/productApi';
import { initHeader, urlServer } from '../utils/constains';
import { renderProductCard } from '../utils/product-card';

async function renderBrand() {
  try {
    const { data } = await brandApi.getAll();
    
    renderBrandList(data);
    renderHotBrand(data);
  } catch (error) {}
}

async function renderBrandList(data) {
  const brandHTML = data
    .map((brand) => {
      return `<li class='brand_item'>
        <a href='./search.html?thuong_hieu=${brand['ten_thuong_hieu']}' class='brand_link'>
          <div class="brand_img">
            <img
              src="${urlServer + '/images/' + brand['icon']}"
              alt="${brand['ten_thuong_hieu']}"
            />
          </div>
          <span>
            ${brand['ten_thuong_hieu']}
          </span>
        </a>
      </li>`;
    })
    .join('');

  $('.brand').html(brandHTML);
}

async function renderBanner() {
  try {
    const { data } = await productApi.getAllWithParams({
      noi_bat: true,
    });

    const productHTML = data
      .slice(0, 6)
      .map((product) => {
        return `<a href="/product-detail.html?id=${product['ma_san_pham']}" class='slider-background'>
          <img
            src='${urlServer}/images/${product['hinh_anh'][0]}'
            alt='${product['hinh_anh'][0]}'>
        </a>`;
      })
      .join('');

    $('.slider').html(productHTML);

    $('.slider').slick({
      dots: true,
      infinite: true,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 3000,
      prevArrow:
        '<button class="slick-prev slick-arrow" aria-label="Previous" type="button" style="display: block;"><i class="fa-solid fa-chevron-left"></i></button>',
      nextArrow:
        '<button class="slick-next slick-arrow" aria-label="Next" type="button" style="display: block;"><i class="fa-solid fa-chevron-right"></i></button>',
    });
  } catch (error) {
    console.log(error.message);
  }
}

async function renderProduct() {
  try {
    const { data: bestsellerList } = await productApi.getAll({
      sort: 'bestseller',
    });
    const { data: hotList } = await productApi.getAll({
      sort: 'sale',
    });

    const { data } = await productApi.getAll();

    renderHotProduct(hotList);

    renderProductList(bestsellerList);
    renderForUserProductList(data);
  } catch (error) {
    console.log(error.message);
  }
}

function renderHotProduct(data) {
  const productHTML = data
    .slice(0, 10)
    .map((product) => {
      return renderProductCard(product, 'me-2');
    })
    .join('');

  $('.deal-slider').html(productHTML);

  $('.deal-slider').slick({
    dots: false,
    infinite: false,
    slidesToShow: 5,
    slidesToScroll: 5,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
    prevArrow:
      '<button class="slick-prev slick-arrow" aria-label="Previous" type="button" style="display: block;"><i class="fa-solid fa-chevron-left"></i></button>',
    nextArrow:
      '<button class="slick-next slick-arrow" aria-label="Next" type="button" style="display: block;"><i class="fa-solid fa-chevron-right"></i></button>',
  });
}

function renderForUserProductList(data) {
  const productHTML = data
    .slice(0, 10)
    .map((product) => {
      const productCardHTML = renderProductCard(product, '');

      return `<div class="col-12 col-sm-6 col-md-4 col-lg-3">
          ${productCardHTML}
        </div>`;
    })
    .join('');

  $('.for-users_body .row').html(productHTML);
}

function renderProductList(data) {
  const productHTML = data
    .slice(0, 10)
    .map((product) => {
      const productCardHTML = renderProductCard(product, '');

      return `<div class="col-12 col-sm-6 col-md-4 col-lg-3">
          ${productCardHTML}
        </div>`;
    })
    .join('');

  $('.bestseller_body .row').html(productHTML);
}

async function renderHotBrand(data) {
  const brandHTML = data
    .slice(0, 4)
    .map((brand) => {
      return `<a class='top-brands_card' href='/search.html?thuong_hieu=${brand['ten_thuong_hieu']}'>
        <div class='top-brands_image'>
          <img src='${urlServer}/images/${brand['hinh_anh']}' alt='${brand['ten_thuong_hieu']}'>
        </div>
        <h3 class='top-brands_title'>${brand['ten_thuong_hieu']}</h3>
      </a>`;
    })
    .join('');

  $('.top-brands_slider').html(brandHTML);

  $('.top-brands_slider').slick({
    dots: false,
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 3,
    autoplay: true,
    autoplaySpeed: 2000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
    prevArrow:
      '<button class="slick-prev slick-arrow" aria-label="Previous" type="button" style="display: block;"><i class="fa-solid fa-chevron-left"></i></button>',
    nextArrow:
      '<button class="slick-next slick-arrow" aria-label="Next" type="button" style="display: block;"><i class="fa-solid fa-chevron-right"></i></button>',
  });
}

initHeader();
renderBrand();
renderBanner();
renderProduct();
