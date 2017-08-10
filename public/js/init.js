var db;

$.ajax({
    type: 'get',
    url: '/api/products',
    dataType : 'json',
    success: function(data) {
        db = data;
        successHandler();
    },
    error:  function() {
        errorHandler();
    }
});

function successHandler() {
    addHeader();
    addCartProduct();
    updateTotal();
    addPurchaseBtn();
    purchase();

    $('.c-item__close-button').on('click', setPopupEvents);
}

function errorHandler() {
    $('#products').html('Services unavailable');
}

function addHeader() {
    var title = db.searchVehicle,
        newHeader = $(
        '<div class="c-header">' + title.year + ' ' + title.make + ' ' + title.model + ' ' + title.name + ' ' +
        title.option + '</div>'
        );

    $('body').prepend(newHeader);
}

function addCartProduct() {
    var newElems;

    $.each(db.products, function (i, el) {
        newElems = $(
            '<div class="c-item">' +
            '<img class="c-item__image" src="' + el.imgUrl + '"/>' +
            '<div class="c-item__wrap">' +
            '<h2 class="c-item__header">' + el.pName + '</h2>' +
            '<div class="c-item__id">Product #' + el.id + '</div>' +
            '<div class="c-item__vehicle">Vehicle: ' +
            '<span class="c-item__vehicle-info">' + el.vehicle.year + ' ' + el.vehicle.make + ' ' + el.vehicle.model
            + ' ' + el.vehicle.name + ' ' + el.vehicle.option + '</span>' +
            '</div>' +
            '<div class="c-item__size">Size/ Style: ' +
            '<span class="c-item__size-info">' + el.sizeStyle + '</span>' +
            '</div>' +
            '<div class="c-item__quantity">QTY: ' +
            '<input class="c-item__qty-input" type="text" value="'+ el.pQuantity +'">' +
            '<span class="c-item__update">Update</span>' +
            '</div>' +
            '</div>' +
            '<div class="c-item__price-wrap"><div class="c-item__close-button">&times;</div>' +
            '<div class="c-item__price">$<span class = "c-item__price-value">' + el.pPrice + '</span></div>' +
            '<div class="c-item__total">total: $'+ el.pQuantity * el.pPrice + '</div>' +
            '</div>'
        );

        validationRender(el, newElems);
    });
}

function validationRender(el, newElems) {
    var message1 = $(
        '<div class="c-error-message"><img class="c-error-message__image" src="../img/warning.png">' +
        '<div class="c-error-message__text">The product out of stock</div></div>'
    ),
        message2 = $(
        '<div class="c-error-message"><img class="c-error-message__image" src="../img/warning.png">' +
        '<div class="c-error-message__text">Please set QTY</div></div>'
    ),
        sum = el.totalProduct.stock + el.totalProduct.sklad;

    if (el.pQuantity > sum) {
        $('#products').append(message1, newElems);
        removeErrorMessage();
    } else if (el.pQuantity == 0) {
        $('#products').append(message2, newElems);
        removeErrorMessage();
    } else {
        $('#products').append(newElems);
    }
}

function updateTotal() {
    var quantity,
        index,
        updateButton = $('.c-item__update');

    updateButton.on('click', function() {
        index = updateButton.index(this);
        quantity = $('.c-item__qty-input').eq(index).val();
        validationOfInteger(quantity, index);
    });
}

function validationOfInteger (quantity, index) {
    if (parseInt(quantity) != quantity ) {
        addErrorMessage(index, 'The number of ordered units must be an integer.');
        removeErrorMessage(index);
    } else {
        validationOfQuantity(quantity, index);
    }
}

function  validationOfQuantity(quantity, index) {
    var stock = db.products[index].totalProduct.stock,
        sklad = db.products[index].totalProduct.sklad,
        onlyStore = db.products[index].isInStoreOnly,
        sum = stock + sklad;

    if (quantity > 0 && quantity <= 99 && sum >= 99) {
        setTotal(index, quantity);
        removeErrorMessage(index);
    } else if (quantity > 0 && sum <= 99 && quantity <= sum) {
        setTotal(index, quantity);
        removeErrorMessage(index);
    } else if (quantity <= 0) {
        addErrorMessage(index, 'Please set QTY');
        removeErrorMessage(index);
    } else if (quantity >= 99) {
        addErrorMessage(index, 'Sorry, the maximum quantity you can order 99');
        removeErrorMessage(index);
    } else if (quantity > 0 && quantity > sum && sum > 0) {
        addErrorMessage(index, 'Sorry, the maximum quantity you can order is ' + sum);
        removeErrorMessage(index);
    } else if (sum === 0) {
        addErrorMessage(index, 'The product out of stock');
        removeErrorMessage(index);
    } else if (onlyStore = true && quantity <= stock) {
        setTotal(index, quantity);
        removeErrorMessage(index);
    } else if (onlyStore = true && quantity >= stock) {
        addErrorMessage(index, 'Sorry, the maximum quantity you can order ' + stock);
        removeErrorMessage(index);
    }
}

function setTotal(index, quantity) {
    var itemPrice = db.products[index].pPrice,
        total = quantity * itemPrice;

    $('.c-item__total').eq(index).html('total:$' + total);
}

function addErrorMessage(index, message) {
    var messageElement = $(
        '<div class="c-error-message"><img class="c-error-message__image" src="../img/warning.png">' +
        '<div class="c-error-message__text"></div></div>'
    );

    $('.c-item').eq(index).before(messageElement);
    $('.c-error-message__text').html(message);
    $('.c-item__qty-input').eq(index).css('border', '1px solid red');
    $('.c-item__total').eq(index).html('total:$ 0');
}

function removeErrorMessage(index) {
   setTimeout(function() {
        $('.c-error-message').fadeOut(1000);
        $('.c-error-message').remove();
        $('.c-item__qty-input').eq(index).css('border', '1px solid grey');
    }, 5000);
}

function addPopup() {
    var popupElement = $(
        '<div class="c-popup">' +
        '<div class="c-popup__container">' +
        '<p class="c-popup__text">Do you want to delete this element?</p>' +
        '<ul class="c-popup__buttons">' +
        '<li class="c-popup__yes">Yes</li>' +
        '<li class="c-popup__no">No</li></ul>' +
        '<span class="c-popup__close">&times;</span>' +
        '</div>' +
        '</div>'
    );

    $('.container').append(popupElement);
}


function setPopupEvents() {
    var that = this;
    addPopup();

    $('.c-popup__yes').on('click', function(){
        that.closest('.c-item').remove();
        $('.c-popup').remove();
    });

    $('.c-popup__no').on('click', function(){
        $('.c-popup').remove();
    });

    $('.c-popup').on('click', function(event){
        if( $(event.target).is('.c-popup__close') || $(event.target).is('.c-popup') ) {
            event.preventDefault();
            $('.c-popup').remove();
        }
    });

    $('.c-popup__close').on('click', function(event){
        $('.c-popup').remove();
    });

    $(document).keyup(function(event){
        if(event.which=='27'){
            $('.c-popup').remove();
        }
    });
}

function addPurchaseBtn() {
    var byeButton = $(
        '<div class="c-purchase">' +
        '<button class="c-purchase__button"><span class="c-purchase__plus">+</span> Buy</button>' +
        '</div>'
    );

    $('.container').append(byeButton);
}

function purchase() {
    var quantity,
        purchaseButton = $('.c-purchase__button'),
        item = $('.c-item'),
        QTY = $('.c-item__qty-input');

    purchaseButton.on('click', function() {
        $.each(item, function (i, elem) {
            quantity = QTY.eq(i).val();
            validationOfInteger(quantity, i);
        });

        console.log('Thank you for your purchase!');
    });
}