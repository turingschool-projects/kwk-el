
var site = site || {};

site.productSort = {
  init: function(productsArray) {

    var that = this;
    var productsArray = productsArray;
    var $sortSelect = $('.js-product-sort');
    var $sortContainer = $('.mpp__product-sort-container');
    //hide extra sort selects
    if ($sortContainer.length > 1) {
      $sortContainer.each(function(index, sort) {
        if (index !== 0) {
          $(this).hide();
        }
      });
    }
    //alphabetical names
    var productsArrayNames = _.sortBy(productsArray, function(p) {
      var tempNames = p.PROD_RGN_NAME.toLowerCase();
      //strip out html
      tempNames = tempNames.replace(/<(?:.|\n)*?>/gm, ' ');
      return tempNames;
    });
    //console.log(_.pluck(productsArrayNames, 'PROD_RGN_NAME'));

    //newest - MISC_FLAG new shades (3) and new (1)
    var productsArrayNewest = _.filter(productsArray, function(p){ return p.MISC_FLAG == 1 || p.MISC_FLAG == 3; });
    var productDiff = _.difference(productsArray, productsArrayNewest);
    productsArrayNewest = productsArrayNewest.concat(productDiff);
    //rated - AVERAGE_RATING
    var productsArrayRated = _.sortBy(productsArray, function(p) {
      return -p.AVERAGE_RATING;
    });

    //price high
    var productsArrayPriceHigh = _.sortBy(productsArray, function(p) {
      var skuPrice = _.min(p.skus, function(sku){ return Number(sku.PRICE); });
      skuPrice = Number(skuPrice.PRICE);
      return -skuPrice;
    });

    //price low
    var productsArrayPriceLow = _.sortBy(productsArray, function(p) {
      var skuPrice = _.min(p.skus, function(sku){ return Number(sku.PRICE); });
      skuPrice = Number(skuPrice.PRICE);
      return skuPrice;
    });

    $sortSelect.change(function(event) {
      var $selected = $(this).find('option:selected');
      var dataSort = $selected.attr('data-sort');
      var sortedProducts;
      if (dataSort == 'all') {
        //all
        sortedProducts = productsArray;
      }
      else if (dataSort == 'name') {
        //name
        sortedProducts = productsArrayNames;
      }
      else if (dataSort == 'newest') {
        //newest
        sortedProducts = productsArrayNewest;
      }
      else if (dataSort == 'rated') {
        //rated
        sortedProducts = productsArrayRated;
      }
      else if (dataSort == 'price-high') {
        //price-high
        sortedProducts = productsArrayPriceHigh;
      }
      else if (dataSort == 'price-low') {
        //price-low
        sortedProducts = productsArrayPriceLow;
      }
      that.sort(sortedProducts);
    });
  },
  sort: function(sortedProducts) {
    var $productContainer = $('.mpp__product-grid');
    if ($productContainer.length < 1) {
      return null;
    }
    // multi product grid
    if ($productContainer.length > 1) {
      this.sortMultiGrid(sortedProducts);
      return;
    }
    var $products = $('.mpp__product');
    //strip sorted object for PRODUCT_ID
    var productIDs = _.pluck(sortedProducts, 'PRODUCT_ID');

    //console.log(_.pluck(sortedProducts, 'PROD_RGN_NAME'));
    var $sortedProducts = [];
    //sort by PRODUCT_ID <> data-productid
    var dataProductId;

    if ($products.eq(0).attr('data-productid')) {
      dataProductId = 'data-productid';
    }
    else if ($products.eq(0).attr('data-product-id')) {
      dataProductId = 'data-product-id';
    }

    $(productIDs).each(function(index, prodID) {
      $sortedProducts.push($products.filter("["+dataProductId+"=" + prodID +  "]"));
    });
    //remove styles on $products
    $products.removeAttr('style');
    //move sorted products to top
    if ($productContainer.length > 1) {
      $productContainer.each(function(index, container) {
        $(this).data('prodCount', $('.mpp__product',$(this)).length );
      });
      $productContainer.each(function(index, container) {
        var prodCount = $(this).data('prodCount');
        var countArray = [];
        for(i=index; i>=0; i--) {
          countArray.push($productContainer.eq(i).data('prodCount'));
        }
        countArray.reverse();
        var lastCount = countArray[countArray.length-1];
        countArray.pop();
        var startIndex = 0;
        $(countArray).each(function() {
          startIndex += this;
        });
        //range
        var $productRange = $sortedProducts.slice(startIndex,(startIndex+prodCount));
        $(this).prepend($productRange);
      });
    }
    else {
      // apply original tout positions after sorting products
      var toutsPlaceholder = this.getTouts($products);
      $productContainer.prepend($sortedProducts);
      this.insertTouts(toutsPlaceholder, $sortedProducts);
    }
    //update row heights
    site.product.view.equalRowHeightFunc($('.mpp__product'));
    site.product.view.miscFlagAlign($('.mpp__product'));
    site.product.view.adjustMppProductGrid();
    // site.product.view.adjustMppProductHeights();
  },


  // multi grid sort and inv status sort
  sortMultiGrid: function(sortedProducts) {
    var $productContainer = $('.mpp__product-grid');
    if ($productContainer.length < 1) {
      return null;
    }
    var $products = $('.mpp__product');
    //strip sorted object for PRODUCT_ID
    var productIDs = _.pluck(sortedProducts, 'PRODUCT_ID');

    var dataProductId;

    // all products
    var multiGridMppProductsObj = [];
    var multiGridMppProductsIdsL2 = [];
    var toutsPlaceholder = [];

    if ($productContainer.length > 1) {
      // products in each containers
      $productContainer.each(function(i) {
        var productIdM = $(this).find('.mpp__product[data-product-id]');
        var touts = $(this).find('.mpp__product[data-position]');
        multiGridMppProductsObj.push(productIdM);
        if (touts.length > 0) {
          toutsPlaceholder.push({ 'item': touts, 'position': i });
        }
      });
      // products ids
      var multiGridMppProductsIds = [];
      $(multiGridMppProductsObj).each(function(i) {

        var gridProductsIds = [];
        $(this).each(function(i) {
          var productIDsMulti = $(this).data('product-id');
          gridProductsIds.push(productIDsMulti);
        });
        multiGridMppProductsIds.push(gridProductsIds);
      });

      // l2 products (sortedProducts)
      var productIDsL2 = _.pluck(sortedProducts, 'PRODUCT_ID');
      $.each(multiGridMppProductsIds, function(i, prodIds) {
        var productIDsL2List = _.intersection(productIDsL2, $(this));
        multiGridMppProductsIdsL2.push(productIDsL2List);
      });
    }

    if ($products.eq(0).attr('data-productid')) {
      dataProductId = 'data-productid';
    }
    else if($products.eq(0).attr('data-product-id')) {
      dataProductId = 'data-product-id';
    }
    //remove styles on $products
    $products.removeAttr('style');

    // make new list of products (w ids/grid data)
    var productsArrayNew = [];
    $(multiGridMppProductsIdsL2).each(function(index, iProductIdl2){
      var productIDs = iProductIdl2;
      var indexI = index;
      $.each(productIDs, function(i, prodID) {
        var prs = _.filter(multiGridMppProductsObj[indexI], function(p, i) {
          $(p).data('grid', indexI);
          if ($(p).data('product-id') === prodID) {
            return p;
          }
        });
        productsArrayNew.push(prs[0]);
      });
    });


    // group list by grids
    var prodsSortedGrids = _.groupBy(productsArrayNew, function(p) {
      return $(p).data('grid');
    });
    // distribute list amongst grids
    $.each(prodsSortedGrids, function(i) {
      $productContainer.eq(i).prepend($(this));
    });
    this.insertTouts(toutsPlaceholder, productsArrayNew);

    //update row heights
    site.product.view.equalRowHeightFunc($('.mpp__product'));
    site.product.view.miscFlagAlign($('.mpp__product'));
    site.product.view.adjustMppProductGrid();
  },

  getTouts: function($products) {
    var toutsPlaceholder = [];
    $products.each(function(i) {
      var $toutGrid = $(this);
      if ($toutGrid.hasClass('product-grid-custom__tout')) {
        toutsPlaceholder.push($toutGrid);
      }
    });
    return toutsPlaceholder;
  },

  insertTouts: function(toutsPlaceholder, $sortedProducts) {
    _.each(toutsPlaceholder, function(tout, i) {
      if (tout) {
        tout.insertBefore($sortedProducts[tout.data('position') - i]);
      }
    });
  }
};
