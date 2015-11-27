$(function(){
    
  // init database refs
    var fireRoot = new Firebase('https://bankofdad.firebaseio.com/');
    var fireCurrent = fireRoot.child('accounts/jax');

  // config some html settings 
    $('#amount').attr('pattern','\\d+(\\.\\d*)?');
    $('#amount').attr('step','0.25');

  // load data into UI (autodates on change)
    var fnUpdateBalanceText = function(snapshot){
        $('#balance_text').text( '$'+(snapshot.val()||0).toFixed(2) );
      }
    function unwatchBalance(){
      fireCurrent.child('balance').off('value', fnUpdateBalanceText );
    }
    function watchBalance(){
      fireCurrent.child('balance').on('value', fnUpdateBalanceText )
    }
    watchBalance()

  // setup submit button enabling/disabling
    var fnInputChange = function(e){
      if( $('#for').val().length + $('#amount').val().length == 0 ) {
        $('#enter').button('disable');
      } else {
        $('#enter').button('enable');
      }
      $('#enter').button('refresh');

    }  
    fnInputChange();

  // EVENT HANDLERS

  $('#for').on('change', fnInputChange)

  $('#amount').on('change', fnInputChange)

  $('#enter_form').on('submit',function(e){
    // write ledger entry
      fireCurrent.child('txs').push({
          'date': (new Date()).toString().split(' GMT')[0], // friendly date text before the timezone
          'for': $('#for').val(),
          'amt': $('#amount').val()
      });
    // modify balance
      var balance = Number(($('#balance_text').text()||'0').replace(/[^0-9-\.]+/g,'')); // string to #
      var delta = Number(($('#amount').val()||'0').replace(/[^0-9-\.]+/g,'')); // string to #
      balance += delta;
      fireCurrent.child('balance').set(balance);
    // reset ui
      $('#choose_action').val('choose').change();  
    // nix normal submit behaviour
      e.preventDefault();
  })

  $('#choose_action').on('change', function(e){

      if(this.value == 'choose') {

        $('#for').val('');
        $('#amount').val('');

      } else {

        $('#for').val(this.value);

        if (this.value == 'hurt'){
          $('#amount').val('-1.00');
        } else if (this.value == 'antagonize'){
          $('#amount').val('-0.25');
        } else if (this.value == 'ignore'){
          $('#amount').val('-0.25');
        } else if (this.value == 'shout'){
          $('#amount').val('-0.25');
        } else if (this.value == 'allowance'){
          $('#amount').val('3.00');
        }
      }

      fnInputChange();
      
  })
  
  
  $('#account_toggle a').on('click', function(e){
    unwatchBalance(); // unwatch old db balance for updates
    if (this.text.trim() == 'Jax') {
        $('#balance_text').css('color', 'steelblue');
        fireCurrent = fireRoot.child('accounts/jax');
    }
    if (this.text.trim() == 'Remi') {
        $('#balance_text').css('color', 'hotpink');
        fireCurrent = fireRoot.child('accounts/remi');
    }
    watchBalance(); // watch new db balance for updates
  })
  
})
  