import productApi from '../api/productApi';
import { initHeader, urlServer } from '../utils/constains';
import { renderProductCard } from '../utils/product-card';
import { toast } from '../utils/toast';

const params = new URLSearchParams(window.location.search);

const port = 80;

const productID = parseInt(params.get('id'));

const similarProduct = 15;

let amount;

async function getDatabyID(id) {
  try {
    let req = await productApi.getById(id);
    return req;
  } catch (error) {
    console.error(error);
  }
}

async function getAllData() {
  try {
    let req = await productApi.getAll();
    return req;
  } catch (error) {
    console.error(error);
  }
}

async function renderProductDetail() {
  let data = await getDatabyID(productID);
  $('#product__nav-name').html(data['ten_san_pham']);
  amount = data.so_luong;
  let productSection = `
      <div class="product__info-row row" id="${data.ma_san_pham}">
        <div class="product__info-img_container col-lg-3">
          <div class="product__info-img_main-img zoom">
            <img class="main-img" src="${urlServer}/images/${data.hinh_anh[0]}" alt="">
            <img src="${urlServer}/images/${data.hinh_anh[0]}" alt="${data['hinh_anh'][0]}" id="imgZoom">
          </div>
          <div class="product__info-img_sub-img">`;

  data.hinh_anh.forEach((img, idx) => {
    productSection += `<img class="sub-img ${
      idx === 0 ? 'active' : ''
    }" id="${idx}" src="${urlServer}/images/${img}" alt="" width="50px" height="50px">`;
  });
  productSection += `</div>
        </div>
        <div class="product__info-container col-lg">
          ${data.so_luong >= 10 ? `<div class="product__info-status">CÒN HÀNG</div>` : ``}
          ${data.so_luong === 0 ? `<div class="product__info-status empty">HẾT HÀNG</div>` : ``}
          <div class="product__info-name">${data.ten_san_pham}</div>
          <div class="product__info-brand">Thương hiệu ${
            data.thuong_hieu
          } | Mã sản phẩm: ${productID}</div>
          <div class="product__info-warning-amount">
            ${
              data.so_luong > 0 && data.so_luong < 10
                ? `<div class="product__info-rest-amount">Còn ${data.so_luong} sản phẩm</div>`
                : ''
            }
          </div>
          <div class="product__info-price_container">
            <div class="product__info-price">${(
              (data.gia_goc * (100 - data.giam_gia)) /
              100
            ).toLocaleString('vi-VN')} VND</div>
            ${
              data.giam_gia && data.giam_gia !== 0
                ? `
              <div class="product__info-cost_container">
                <span class="product__info-cost">${data.gia_goc.toLocaleString('vi-VN')} VND</span>
                <span class="product__info-discount">-${data.giam_gia}%</span>
              </div>
            `
                : ''
            }
            
          </div>
          <div class="p-0">
            <div class="product__info-btn_container row">
              <button type="button" class="buy-btn col-md-4"
              data-name="${data.ten_san_pham}"
              data-img="${data.hinh_anh[0]}"
              data-cost="${data.gia_goc}"
              data-discount="${data.giam_gia}"
              data-amount="${amount}">MUA NGAY</button>
              <button type="button" class="addToCart-btn col-md" 
              data-name="${data.ten_san_pham}"
              data-img="${data.hinh_anh[0]}"
              data-cost="${data.gia_goc}"
              data-discount="${data.giam_gia}"
              data-amount="${amount}">THÊM VÀO GIỎ HÀNG</button>
            </div>
          </div>
        </div>
      </div>`;

  let detailString = data.mo_ta_san_pham;

  let detailSection = `
      <tr>
        <td>Thương hiệu</td>
        <td>${data.thuong_hieu}</td>
      </tr>
      <tr>
        <td>Bảo hành</td>
        <td>${data.bao_hanh}</td>
      </tr>
      <tr>
        <td>Series laptop</td>
        <td>${data.series_laptop}</td>
      </tr>
      <tr>
        <td>Màu sắc</td>
        <td>${data.mau_sac}</td>
      </tr>
      <tr>
        <td>Thế hệ CPU</td>
        <td>${data.the_he_cpu}</td>
      </tr>
      <tr>
        <td>CPU</td>
        <td>${data.cpu}</td>
      </tr>
      <tr>
        <td>Chip đồ họa</td>
        <td>${data.chip_do_hoa_roi}</td>
      </tr>
      <tr>
        <td>RAM</td>
        <td>${data.ten_ram}</td>
      </tr>
      <tr>
        <td>Màn hình</td>
        <td>${data.man_hinh}</td>
      </tr>
      <tr>
        <td>Lưu trữ</td>
        <td>${data.luu_tru}</td>
      </tr>
      <tr>
        <td>Số cổng lưu trữ tối đa</td>
        <td>${data.so_cong_luu_tru_toi_da}</td>
      </tr>
      <tr>
        <td>Kiểu khe M.2 hỗ trợ</td>
        <td>${data.kieu_khe_m2_ho_tro}</td>
      </tr>
      <tr>
        <td>Cổng xuất hình</td>
        <td>${data.cong_xuat_hinh}</td>
      </tr>
      <tr>
        <td>Cổng kết nối</td>
        <td>${data.cong_ket_noi}</td>
      </tr>
      <tr>
        <td>Kết nối không dây</td>
        <td>${data.ket_noi_khong_day}</td>
      </tr>
      <tr>
        <td>Bàn phím</td>
        <td>${data.ban_phim}</td>
      </tr>
      <tr>
        <td>Hệ điều hành</td>
        <td>${data.he_dieu_hanh}</td>
      </tr>
      <tr>
        <td>Kích thước</td>
        <td>${data.kich_thuoc}</td>
      </tr>
      <tr>
        <td>Pin</td>
        <td>${data.pin}</td>
      </tr>
      <tr>
        <td>Khối lượng</td>
        <td>${data.khoi_luong}</td>
      </tr>
      <tr>
        <td>Đèn LED trên máy</td>
        <td>${data.den_led ? 'Có' : 'Không'}</td>
      </tr>
      <tr>
        <td>Màn hình cảm ứng</td>
        <td>${data.man_hinh_cam_ung ? 'Có' : 'Không'}</td>
      </tr>`;

  $('.product__info').html(productSection);
  $('.product__detail-description').text(detailString);
  $('.product__detail-table').html(detailSection);
  if (false) {
    $('.buy-btn').attr('disabled', true);
    $('.addToCart-btn').attr('disabled', true);
  } else {
    $('.buy-btn').on('click', BuyBtnHandler);
    $('.addToCart-btn').on('click', AddToCartBtnHandler);
  }

  $('.sub-img').on('mouseover', (e) => {
    $('.sub-img.active').removeClass('active');
    e.target.classList.add('active');
    $('.main-img').attr('src', `${urlServer}/images/${data.hinh_anh[e.target.id]}`);
    $('#imgZoom').attr('src', `${urlServer}/images/${data.hinh_anh[e.target.id]}`);
  });

  const zoom = document.querySelector('.zoom');
  const imgZoom = document.querySelector('#imgZoom');

  zoom.addEventListener('mousemove', (e) => {
    imgZoom.style.opacity = 1;
    let positionPx = e.x - zoom.getBoundingClientRect().left;
    let positionX = (positionPx / zoom.offsetWidth) * 100;

    let positionPy = e.y - zoom.getBoundingClientRect().top;
    let positionY = (positionPy / zoom.offsetHeight) * 100;

    imgZoom.style.setProperty('--zoom-x', positionX + '%');
    imgZoom.style.setProperty('--zoom-y', positionY + '%');
  });

  zoom.addEventListener('mouseout', (e) => {
    imgZoom.style.opacity = 0;
  });
}

async function renderSimilarProduct() {
  let data = await getAllData();

  let jsonLength = Object.keys(data['data']).length - 1;
  let productIdx = data['data'].findIndex((item) => item.ma_san_pham === productID);
  let similarProductCard = ``;
  let nextProductIdx = productIdx;

  for (let i = 1; i <= similarProduct; i++) {
    nextProductIdx++;
    if (nextProductIdx > jsonLength) {
      nextProductIdx = 0;
    }

    similarProductCard += renderProductCard(data['data'][nextProductIdx]);
  }

  $('.product-slider').slick('slickAdd', similarProductCard);
}

function BuyBtnHandler() {
  let ten_san_pham = this.dataset.name;
  let hinh_anh = this.dataset.img;
  let gia_goc = parseInt(this.dataset.cost);
  let giam_gia = parseInt(this.dataset.discount);
  let so_luong = parseInt(this.dataset.amount);
  let outOfStock = false;

  let CartList = JSON.parse(localStorage.getItem('cartList'));

  if (!CartList) {
    let CartItem = [
      {
        ma_san_pham: productID,
        ten_san_pham: ten_san_pham,
        hinh_anh: hinh_anh,
        gia_goc: gia_goc,
        giam_gia: giam_gia,
        so_luong: 1,
      },
    ];
    localStorage.setItem('cartList', JSON.stringify(CartItem));
  } else {
    let found = false;

    CartList.forEach((item) => {
      if (item.ma_san_pham === productID) {
        if (item.so_luong == so_luong) {
          toast({
            title: 'Xin lỗi',
            message: 'Đã hết hàng trong kho',
            type: 'error',
            duration: 2000,
          });

          found = true;
          outOfStock = false;
        } else {
          item.so_luong++;
          localStorage.setItem('cartList', JSON.stringify(CartList));
          found = true;
        }
      }
    });

    if (!found) {
      let CartItem = {
        ma_san_pham: productID,
        ten_san_pham: ten_san_pham,
        hinh_anh: hinh_anh,
        gia_goc: gia_goc,
        giam_gia: giam_gia,
        so_luong: 1,
      };
      CartList.push(CartItem);
      localStorage.setItem('cartList', JSON.stringify(CartList));
    }
  }

  if (!outOfStock) {
    let CartURL = window.location.protocol + '//' + window.location.hostname + ':5173/cart.html';
    window.location.href = CartURL;
  }
}

function AddToCartBtnHandler() {
  let ten_san_pham = this.dataset.name;
  let hinh_anh = this.dataset.img;
  let gia_goc = parseInt(this.dataset.cost);
  let giam_gia = parseInt(this.dataset.discount);
  let so_luong = parseInt(this.dataset.amount);

  let CartList = JSON.parse(localStorage.getItem('cartList'));

  if (!CartList) {
    let CartItem = [
      {
        ma_san_pham: productID,
        ten_san_pham: ten_san_pham,
        hinh_anh: hinh_anh,
        gia_goc: gia_goc,
        giam_gia: giam_gia,
        so_luong: 1,
      },
    ];
    localStorage.setItem('cartList', JSON.stringify(CartItem));

    toast({
      title: 'Thành công',
      message: 'Đã thêm vào giỏ hàng',
      type: 'success',
      duration: 2000,
    });
  } else {
    let found = false;

    CartList.forEach((item) => {
      if (item.ma_san_pham === productID) {
        if (item.so_luong == so_luong) {
          toast({
            title: 'Xin lỗi',
            message: 'Đã hết hàng trong kho',
            type: 'error',
            duration: 2000,
          });

          found = true;
        } else {
          item.so_luong++;
          localStorage.setItem('cartList', JSON.stringify(CartList));
          found = true;

          toast({
            title: 'Thành công',
            message: 'Đã thêm vào giỏ hàng',
            type: 'success',
            duration: 2000,
          });
        }
      }
    });

    if (!found) {
      let CartItem = {
        ma_san_pham: productID,
        ten_san_pham: ten_san_pham,
        hinh_anh: hinh_anh,
        gia_goc: gia_goc,
        giam_gia: giam_gia,
        so_luong: 1,
      };
      CartList.push(CartItem);
      localStorage.setItem('cartList', JSON.stringify(CartList));

      toast({
        title: 'Thành công',
        message: 'Đã thêm vào giỏ hàng',
        type: 'success',
        duration: 2000,
      });
    }
  }
}

initHeader();
renderProductDetail();
renderSimilarProduct();
