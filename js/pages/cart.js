import orderApi from '../api/orderApi';
import productApi from '../api/productApi';
import {
  convertCurrency,
  getLocalStorage,
  initCartList,
  initHeader,
  urlServer,
} from '../utils/constains';
import { validation } from '../utils/validation';
import { toast } from '../utils/toast';

let CartList;

initCartList();
initHeader();

async function createOrder(data) {
  try {
    await orderApi.add(data);
  } catch (error) {
    console.error(error);
  }
}

$('.btn-delete-all').on('click', deteleAllBtnHandler);

$('.btn-delete').on('click', deteleBtnHandler);

$('.btn-purchase').on('click', purchaseBtnHandler);

$('.delete').on('click', () => {
  $('#delete-all').modal('show');
});

$('.purchase-btn').on('click', async () => {
  const cartList = getLocalStorage('cartList');

  if (!cartList || cartList?.length <= 0) {
    $('#purchase').modal('hide');
    return;
  }

  const user = getLocalStorage('user');

  if (!user || !user?.infor) {
    toast({
      title: 'Bạn phải đăng nhập rồi mới được mua hàng',
      message: 'Chuyển trang sau 5 giây',
      type: 'warning',
    });
    setTimeout(() => (window.location.href = '/login.html'), 5000);
    return;
  }

  const infor = user.infor;

  $('#purchase #Name').val(infor['ten_khach_hang']);
  $('#purchase #Tel').val(infor['so_dien_thoai']);
  $('#purchase #Address').val(infor['dia_chi']);

  $('#purchase').modal('show');
});

async function renderCartList() {
  CartList = JSON.parse(localStorage.getItem('cartList'));
  const { data: productList } = await productApi.getAll();

  if (CartList.length > 0) {
    let htmlString = '';
    CartList.forEach((item, idx) => {
      const data = productList.find((product) => product.ma_san_pham === item.ma_san_pham);
      htmlString += `
        <tr class="table-body_row" id=${idx + 1}>
            <td class="table-body_item">${idx + 1}</td>
            <td class="table-body_item">
          <a class="product-link" href="/product-detail.html?id=${item.ma_san_pham}">
              <div class="product-container">
                  <div class="product-img_container">
                      <img class="product-img" src="${urlServer}/images/${
        item.hinh_anh
      }" alt="" width="80px"
                          height="80px">
                  </div>
                  <div class="product-name_container">
                      <span class="product-name">${item.ten_san_pham}</span>
                  </div>
              </div>
          </a>
            </td>
            <td class="table-body_item">
              <div class="product-price_container">
                ${
                  item.giam_gia !== 0 && item.giam_gia
                    ? `
                  <div class="product-price">${convertCurrency(
                    (item.gia_goc * (100 - item.giam_gia)) / 100
                  )}</div>
                  <div class="product-cost">${convertCurrency(item.gia_goc)}</div>
                `
                    : `<div class="product-price">${convertCurrency(item.gia_goc)}</div>`
                }
              </div>
            </td>
            <td class="table-body_item">
              <div class="product-amount_container" data-id="${item.ma_san_pham}" data-max="${
        data.so_luong
      }" data-idx="${idx}">
                  <button class="product-amount_minus" id="${idx + 1}">-</button>
                  <input class = "amount-${
                    idx + 1
                  }" type="number" name="amount" id="amount" data-id="${
        item.ma_san_pham
      }" data-amount="1" min="1" value="${item.so_luong}">
                  <button class="product-amount_plus" id="${idx + 1}" ${
        item.so_luong == data.so_luong ? 'disabled' : ''
      }>+</button>
              </div>
              <div class="delete-product" id=${item.ma_san_pham}>Xoá</div>
            </td>
        </tr>`;

      $('.table-body').html(htmlString);
      $('.product-amount_minus').on('click', minusBtnHandler);
      $('.product-amount_plus').on('click', plusBtnHandler);
      $('input[name="amount"]').on('change', valueValidation);
      $('.delete-product').on('click', (e) => {
        $('#delete-product').modal('show');
        let ID = e.target.id;
        $('.btn-delete').attr('id', ID);
      });
    });
  } else {
    let htmlString = `
    <div class="cart-link">
      <a href="">Trang chủ </a><span id="seperate">/</span><a href="">Giỏ hàng</a>
    </div>
    <div class="no-product-container">
      <img src="https://shopfront-cdn.tekoapis.com/static/empty_cart.png" width="25%" height="25%">
      <p class="no-product-info">Giỏ hàng chưa có sản phẩm nào</p>
      <a href="http://localhost:5173/index.html"><button class="no-product-btn">Mua sắm ngay</button></a>
    </div>`;

    $('.cart-container').html(htmlString);
  }
}

function renderTotal() {
  CartList = JSON.parse(localStorage.getItem('cartList')) || [];
  let total = 0;

  if (CartList.length > 0) {
    CartList.forEach((item, idx) => {
      total += ((item.gia_goc * (100 - item.giam_gia)) / 100) * item.so_luong;
    });
  }

  $('.pre-price, .total-price').text(total.toLocaleString('vi-VN') + ' VND');
}

function minusBtnHandler() {
  $(`button[id=${this.id}][class="product-amount_plus"]`).attr('disabled', false);

  let val = parseInt($(`.amount-${this.id}`).val());

  if (val > parseInt(this.parentElement.dataset.max)) {
    toast({
      title: 'Xin lỗi',
      message: `Hàng chỉ còn ${this.parentElement.dataset.max} sản phẩm`,
      type: 'info',
      duration: 2000,
    });
    $(`button[id=${this.id}][class="product-amount_plus"]`).attr('disabled', true);
    $(`.amount-${this.id}`).val(this.parentElement.dataset.max);
    $(`.amount-${this.id}`).attr('data-amount', this.parentElement.dataset.max);
    CartList[this.id - 1].so_luong = parseInt(this.parentElement.dataset.max);
    localStorage.setItem('cartList', JSON.stringify(CartList));
    return;
  }

  if (true) {
    $(`.amount-${this.id}`).val(val - 1);
  } else {
    $(`.amount-${this.id}`).val(val - 1);
    $(`button[id=${this.id}][class="product-amount_minus"]`).attr('disabled', true);
  }

  CartList[this.id - 1].so_luong = val - 1;
  localStorage.setItem('cartList', JSON.stringify(CartList));

  renderTotal();
}

async function plusBtnHandler() {
  $(`button[id=${this.id}][class="product-amount_minus"]`).attr('disabled', false);

  let val = parseInt($(`.amount-${this.id}`).val());

  if (val > parseInt(this.parentElement.dataset.max)) {
    toast({
      title: 'Xin lỗi',
      message: 'Không đủ hàng trong kho',
      type: 'error',
      duration: 2000,
    });
    $(`button[id=${this.id}][class="product-amount_plus"]`).attr('disabled', true);
    $(`.amount-${this.id}`).val(this.parentElement.dataset.max);
    $(`.amount-${this.id}`).attr('data-amount', this.parentElement.dataset.max);
    CartList[this.id - 1].so_luong = parseInt(this.parentElement.dataset.max);
    localStorage.setItem('cartList', JSON.stringify(CartList));
    return;
  }

  if (val === parseInt(this.parentElement.dataset.max) - 1) {
    $(`button[id=${this.id}][class="product-amount_plus"]`).attr('disabled', true);
  }

  $(`.amount-${this.id}`).val(val + 1);

  CartList[this.id - 1].so_luong = val + 1;
  localStorage.setItem('cartList', JSON.stringify(CartList));

  renderTotal();
}

async function valueValidation() {
  if ($(this).val() <= 0) {
    toast({
      title: 'Cảnh báo',
      message: 'Số lượng phải lớn hơn 0',
      type: 'warning',
      duration: 2000,
    });
    $(this).val($(this).attr('data-amount'));
    return;
  }

  if ($(this).val() > parseInt(this.parentElement.dataset.max)) {
    toast({
      title: 'Xin lỗi',
      message: 'Không đủ hàng trong kho',
      type: 'error',
      duration: 2000,
    });
    $(this).val($(this).attr('data-amount'));
    return;
  }

  if ($(this).val() == 1) {
    this.parentElement.querySelector('.product-amount_minus').disabled = true;
  } else {
    this.parentElement.querySelector('.product-amount_minus').disabled = false;
  }

  if ($(this).val() == this.parentElement.dataset.max) {
    this.parentElement.querySelector('.product-amount_plus').disabled = true;
  } else {
    this.parentElement.querySelector('.product-amount_plus').disabled = false;
  }

  this.dataset.amount = $(this).val();
  renderTotal();

  CartList[parseInt(this.parentElement.dataset.idx)].so_luong = $(this).val();
  localStorage.setItem('cartList', JSON.stringify(CartList));
}

function deteleBtnHandler() {
  let deleteID = parseInt(this.id);
  let tmp = CartList.filter((item) => item.ma_san_pham !== deleteID);
  CartList = tmp;
  localStorage.setItem('cartList', JSON.stringify(CartList));
  $('.table-body').children().remove();
  $('#delete-product').modal('hide');
  renderCartList();

  renderTotal();
}

function deteleAllBtnHandler() {
  localStorage.setItem('cartList', JSON.stringify([]));
  $('.table-body').children().remove();
  $('#delete-all').modal('hide');

  renderCartList();
  renderTotal();
}

async function purchaseBtnHandler() {
  let mes = validation($('#Paid')[0]);
  let outOfStock = false;
  if (!mes) {
    let method = $('#Paid').val();
    let List = JSON.parse(localStorage.getItem('cartList'));
    let PurchaseList = [];

    List.forEach((item) => {
      const stock = $(`.product-amount_container[data-id="${item.ma_san_pham}"]`).attr('data-max');
      if (item.so_luong > stock) {
        toast({
          title: 'Xin lỗi',
          message: `${item.ten_san_pham} không đủ hàng trong kho`,
          type: 'error',
          duration: 5000,
        });

        let filteredList = List.filter((obj) => obj.ma_san_pham !== item.ma_san_pham);
        List = filteredList;
        outOfStock = true;
        localStorage.setItem('cartList', JSON.stringify(filteredList));
      }
      let PurchaseItem = {
        ma_san_pham: item.ma_san_pham,
        ten_san_pham: item.ten_san_pham,
        don_gia: item.gia_goc,
        giam_gia_san_pham: item.giam_gia,
        so_luong_da_mua: item.so_luong,
      };

      PurchaseList.push(PurchaseItem);
    });

    renderCartList();

    if (outOfStock) {
      $('#purchase').modal('hide');
      return;
    }

    const user = getLocalStorage('user');

    let Order = {
      ma_khach_hang: user.userId,
      trang_thai: 'chờ xử lý',
      hinh_thuc_thanh_toan: method,
      thoi_gian_dat_mua: parseInt(new Date().getTime()),
      danh_sach_san_pham_da_mua: PurchaseList,
    };

    await createOrder(Order);

    $('.table-body').children().remove();
    $('#purchase').modal('hide');
    localStorage.setItem('cartList', JSON.stringify([]));
    initCartList();
    renderTotal();
    renderCartList();

    toast({
      title: 'Thành công',
      message: 'Cảm ơn bạn đã mua hàng',
      type: 'success',
      duration: 2000,
    });
  }
}

renderCartList();
renderTotal();
