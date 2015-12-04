$(function(){
    
  // init database refs
    var fireRoot = new Firebase('https://bankofdad.firebaseio.com/');
    var fireCurrent = fireRoot.child('accounts/jax');
    var balance;

  // config some html settings 
    $('#home_amount').attr('pattern','\\d+(\\.\\d*)?');
    $('#home_amount').attr('step','0.25');
    $('#ledger_tx_list').listview({
        autodividers:true, 
        autodividersSelector: function(li){
            return li.attr('date');
        } 
    });

  // load data into balance UI (autodates on change)
    var fnUpdateBalance = function(snapshot){
        balance = snapshot.val()||0;
        $('.balance_text').text( '$'+balance.toFixed(2) );
      };
    
    var fnUpdateList = function(snapshot) {
		$('#ledger_tx_list').empty();
        
        snapshot.forEach(function(it){
            var itval = it.val();
			$('#ledger_tx_list').prepend(
                '<li class="txlistitem" key="'+it.key()+'" date="'+itval.date.slice(0,11)+'" amt="'+itval.amt+'" data-icon=delete><a><h3>' + '' + (itval.amt>0?'+':'&nbsp;') + itval.amt + '&nbsp;&nbsp;&nbsp;' + itval.for + '</h3></a></li>'
            );
        });
        
        $('#ledger_tx_list').listview('refresh');
        $('#ledger_tx_list .txlistitem').on('click', fnTxListItemClick);

    };
    
    function unwatchBalance(){
      fireCurrent.child('balance').off('value', fnUpdateBalance );
      fireCurrent.child('txs').off('value', fnUpdateList);
    }

    function watchBalance(){
      fireCurrent.child('balance').on('value', fnUpdateBalance );
      fireCurrent.child('txs').on('value', fnUpdateList);
    }
    watchBalance();

  // setup submit button enabling/disabling
    var fnInputChange = function(e){
      if( $('#home_for').val().length + $('#home_amount').val().length === 0 ) {
		$('#home_enter').addClass('ui-disabled');
      } else {
		$('#home_enter').removeClass('ui-disabled');
      }
    }  ;
    fnInputChange();

  // EVENT HANDLERS

  $('#home_for').on('change', fnInputChange);

  $('#home_amount').on('change', fnInputChange);

  $('#home_enter').on('click',function(e){
    // write ledger entry
      fireCurrent.child('txs').push({
          'date': (new Date()).toString().split(' GMT')[0], // friendly date text before the timezone
          'for': $('#home_for').val(),
          'amt': $('#home_amount').val()
      });
    // modify balance
      var delta = Number(($('#home_amount').val()||'0').replace(/[^0-9-\.]+/g,'')); // string to #
      balance += delta;
      fireCurrent.child('balance').set(balance);
    // reset ui
      $('#home_choose_action').val('choose').change();  
  });

  $('#home_choose_action').on('change', function(e){

      if(this.value == 'choose') {

        $('#home_for').val('');
        $('#home_amount').val('');

      } else {

        $('#home_for').val(this.value);

        if (this.value == 'hurt'){
          $('#home_amount').val('-1.00');
        } else if (this.value == 'antagonize'){
          $('#home_amount').val('-0.25');
        } else if (this.value == 'ignore'){
          $('#home_amount').val('-0.25');
        } else if (this.value == 'shout'){
          $('#home_amount').val('-0.25');
        } else if (this.value == 'allowance'){
          $('#home_amount').val('3.00');
        }
      }

      fnInputChange();
      
  });
  
  
  var fnAccountNav = function(){
    unwatchBalance(); // unwatch old db balance for updates
    if (this.text.trim() == 'Jax') {
        $('.balance_text').css('color', 'steelblue');
        $('#home_jax_nav').addClass('ui-btn-active');
        $('#home_remi_nav').removeClass('ui-btn-active');
        $('#ledger_jax_nav').addClass('ui-btn-active');
        $('#ledger_remi_nav').removeClass('ui-btn-active');
        fireCurrent = fireRoot.child('accounts/jax');
    }
    if (this.text.trim() == 'Remi') {
        $('.balance_text').css('color', 'hotpink');
        $('#home_remi_nav').addClass('ui-btn-active');
        $('#home_jax_nav').removeClass('ui-btn-active');
        $('#ledger_remi_nav').addClass('ui-btn-active');
        $('#ledger_jax_nav').removeClass('ui-btn-active');
        fireCurrent = fireRoot.child('accounts/remi');
    }
    watchBalance(); // watch new db balance for updates
  };
  $('#home_account_nav a').on('click', fnAccountNav) ;
  $('#ledger_account_nav a').on('click', fnAccountNav) ;
  $('#home_jax_nav').trigger('click');
    
  
  var fnTxListItemClick = function(){
    var key = $(this).attr('key') || '';
    var amt = $(this).attr('amt') || 0;
	
    fireCurrent.child('txs/'+key).remove(function(err){
        if (err) {
            console.log('Remove failed: ' + err );
		} else {
			balance -= amt;
			fireCurrent.child('balance').set(balance);
		}
    });
    
  };
    

  
});
  