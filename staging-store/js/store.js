var store=(function(document){
  function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    return parts.length == 2 ? parts.pop().split(";").shift():null;
  }
  function createSpan(content, className) {
    var span=document.createElement("span");
    span.className=className;
    span.appendChild(document.createTextNode(content));
    return span;
  }
  function createNostoCartElements(cart,rootCartElement){
    for(var i=0,len=cart.length;i<len;i++){
      var cartItem=cart[i];
      var cartDiv=document.createElement("div");
      cartDiv.className="line_item";
      cartDiv.appendChild(createSpan(cartItem.id,"product_id"));
      cartDiv.appendChild(createSpan(cartItem.quantity,"quantity"));
      cartDiv.appendChild(createSpan(cartItem.name,"name"));
      cartDiv.appendChild(createSpan(cartItem.unit_price,"unit_price"));
      cartDiv.appendChild(createSpan(cartItem.price_currency_code,"price_currency_code"));
      if(cartItem.sku_id){
        cartDiv.appendChild(createSpan(cartItem.sku_id,"sku_id"));
      }
      rootCartElement.appendChild(cartDiv);
    }
  }

  // Load Cart
  var cart=getCookie("cart");
  if(cart!==null){
    cart=JSON.parse(cart);
  }else{
    cart=[];
  }
  return {
    cart:cart,
    addToCart: function(cartItem){
      this.cart.push(cartItem);
      document.cookie="cart="+JSON.stringify(cart)+";path=/";
      this.updateCartSummary();
    },
    renderFullCart: function(){
      var cartElement=document.getElementById("cartDetails");
      var cartWrapper=document.createElement("ul");
      for(var i=0,len=this.cart.length;i<len;i++){
        var cartItem=this.cart[i];
        var cartItemElement=document.createElement("li");
        cartItemElement.appendChild(document.createTextNode(cartItem.name + (cartItem.sku_id?" ("+cartItem.sku_id+")":"") + " - " + cartItem.unit_price + " " + cartItem.price_currency_code + " x " + cartItem.quantity));
        cartWrapper.appendChild(cartItemElement);
      }
      cartElement.appendChild(cartWrapper);
    },
    renderNostoCartTagging: function(){
      var cartElement=document.getElementsByClassName("nosto_cart")[0];
      createNostoCartElements(cart,cartElement);
    },
    updateCartSummary: function(){
      var cartSummary=document.getElementById("cartSummary");
      var children = cartSummary.childNodes;
      for(var i = 0; i < children.length; i++){
        cartSummary.removeChild(children[i]);
      }
      cartSummary.appendChild(document.createTextNode(this.cart.length));
    },
    createOrder: function(){
      var firstName = document.getElementById("firstName").value;
      var lastName = document.getElementById("lastName").value;
      var email = document.getElementById("email").value;
      var newsletter = document.getElementById("newsletter").checked;
      var order={firstName:firstName,lastName:lastName,email:email,newsletter:newsletter};
      document.cookie="order="+JSON.stringify(order)+";path=/";
    },
    processOrder: function(){
      var order=getCookie("order");
      var statusElement=document.getElementById("orderStatus");
      if(order!==null){
        statusElement.appendChild(document.createTextNode("Order Processed Successful"));
        order=JSON.parse(order);
        document.getElementsByClassName("email")[0].appendChild(document.createTextNode(order.email));
        document.getElementsByClassName("first_name")[0].appendChild(document.createTextNode(order.firstName));
        document.getElementsByClassName("last_name")[0].appendChild(document.createTextNode(order.lastName));
        document.getElementsByClassName("marketing_permission")[0].appendChild(document.createTextNode(order.newsletter));
        document.getElementsByClassName("order_number")[0].appendChild(document.createTextNode(new Date().getTime()));
        createNostoCartElements(cart,document.getElementsByClassName("purchased_items")[0]);
        document.cookie = "cart=;path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
        document.cookie = "order=;path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
        this.cart=[];
        this.updateCartSummary();
      }else{
        statusElement.appendChild(document.createTextNode("No Order to Process"));
      }
    },
    processSearch: function(){
      var query=document.location.search;
      var outerElement=document.getElementById("searchResults");
      var resultElement;
      if(query.indexOf("?q=")>-1){
        query=query.split("?q=")[1];
      }else if(query.indexOf("&q=")>-1){
        query=query.split("&q=")[1];
      }else{
        resultElement=document.createElement("h3");
        resultElement.appendChild(document.createTextNode("Search failed! No search parameter found."));
        outerElement.appendChild(resultElement);
        return [];
      }
      query=query.split("&")[0];
      words=query.toLowerCase().split("+");
      results={};
      var productId,i,result;
      for(i = 0; i < words.length; i++){
        var matching=storeIndex.invertedIndex[words[i]];
        if(matching!==undefined){
          for(var j = 0; j < matching.length; j++){
            productId=matching[j];
            if(results[productId]===undefined){
              results[productId]={"productId":productId,"score":1};
            }else{
              results[productId].score+=1;
            }
          }
        }
      }
      var resultArray=[];
      for(productId in results){
        result=results[productId];
        product=storeIndex.index[productId];
        result.name=product.name;
        result.price=product.price;
        result.price_currency_code=product.price_currency_code;
        if(product.img===undefined){
          result.img="./imgs/placeholder.png";
        }else{
          result.img=product.img;
        }
        resultArray.push(result);
      }
      resultArray=resultArray.sort(function(a, b){return b.score-a.score;});
      if(resultArray.length>0){
        var list=document.createElement("ul");
        list.className="gallery";
        for(i=0;i<resultArray.length;i++){
          result=resultArray[i];
          var li=document.createElement("li");
          var link=document.createElement("a");
          link.href="products/"+result.productId+".html";
          var productDiv=document.createElement("div");
          link.appendChild(productDiv);
          var img=document.createElement("img");
          img.className="thumb";
          img.src=result.img;
          productDiv.appendChild(img);
          productDiv.appendChild(document.createTextNode(result.name));
          productDiv.appendChild(document.createElement("br"));
          productDiv.appendChild(document.createTextNode(result.price+" "+result.price_currency_code));
          li.appendChild(link);
          list.appendChild(li);
        }
        outerElement.appendChild(list);
      }else{
        resultElement=document.createElement("h3");
        resultElement.appendChild(document.createTextNode("No results"));
        outerElement.appendChild(resultElement);
        return [];
      }
      return resultArray;
    }
  };
})(document);
