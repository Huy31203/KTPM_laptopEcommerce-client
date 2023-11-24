import { convertCurrency, urlServer } from './constains';

export function renderProductCard(product, className = '') {
  let oldPrice = convertCurrency(product['gia_goc']);
  if (product['giam_gia'] && product['giam_gia'] !== 0) {
    let newPrice = product['gia_goc'] - (product['gia_goc'] * product['giam_gia']) / 100;
    let savePrice = product['gia_goc'] - newPrice;

    newPrice = convertCurrency(newPrice);
    savePrice = convertCurrency(savePrice);

    return `<a class='product-card ${className}' href='/product-detail.html?id=${product['ma_san_pham']}'>
          <span class='product-card_sale'>
            ${product['giam_gia']}%<br>OFF
          </span>
          <div class='product-card_image'>
            <img src='${urlServer}/images/${product['hinh_anh'][0]}' alt='${product['ten_san_pham']}'>
          </div>
          <div class='product-card_info'>
            <h6 class='product-card_title'>${product['ten_san_pham']}</h6>
            <p class='product-card_sale-price'>${newPrice}</p>
            <s class='product-card_price'>${oldPrice}</s>
            <p class='product-card_save-price'>Save -${savePrice}</p>
          </div>
        </a>`;
  }

  return `<a class='product-card ${className}' href='/product-detail.html?id=${product['ma_san_pham']}'>
    <div class='product-card_image'>
      <img src='${urlServer}/images/${product['hinh_anh'][0]}' alt='${product['ten_san_pham']}'>
    </div>
    <div class='product-card_info'>
      <h6 class='product-card_title'>${product['ten_san_pham']}</h6>
      <p class='product-card_sale-price'>${oldPrice}</p>
      <p class='product-card_price'>&nbsp;</p>
      <p class='product-card_save-price'>&nbsp;</p>
    </div>
  </a>`;
}
