//OVERWRITE OF NAVISION FUNCTIONS
function qJqGrid_loadData(grid, obj) {
	//ORIGINAL CODE
    if (obj.FirstRecordDisplayed == null)
        alert("FirstRecordDisplayed è nullo");
    $("#" + grid.id + "_situazionePaging").text("Visualizzate righe dalla " + obj.FirstRecordDisplayed + " alla " + obj.LastRecordDisplayed);
    $("#" + grid.id + "_firstRecord").val(obj.FirstRecordDisplayed);
    $("#" + grid.id + "_lastRecord").val(obj.LastRecordDisplayed);
    $("#" + grid.id + "_bookmarkKeyNext").val(obj.BookmarkKeyNext);
    $("#" + grid.id + "_bookmarkKeyPrev").val(obj.BookmarkKeyPrev);
    $("#" + grid.id + "_bookmarkKeyCurrent").val(obj.BookmarkKeyCurrent);
    $("#" + grid.id + "_bookmarkKeyAll").val(obj.BookmarkKeyAll);
    SetPagerButtonState(obj.HasPreviousPage, "#" + grid.id + "_btnPrev");
    SetPagerButtonState(obj.HasNextPage, "#" + grid.id + "_btnNext");
    $('#' + grid.id).jqGrid("resetSelection");
    $('#' + grid.id).clearGridData(true);
    $('#' + grid.id)[0].addJSONData(obj);

	//TECLA CODE
	var tableRappo=$('#listaRigheOdT');
	if (tableRappo.length){	//se siamo nella lista dei rapportini
		teclaNavision.rappo.tableRappoAdjust(tableRappo,obj);
	}

	//ORIGINAL CODE
    obj = null;
    return;
}

function qJqGrid_firstPage(grid) {
	//TECLA CODE
    //var pagesize = grid.p.rowNum;
	var pagesize=teclaNavision.rappo.MAX_ROWS_NUMBER;
	
	//ORIGINAL CODE
    var url = grid.p.ajaxUrl;
    if (grid.p.onBeforeNavigationReloadButton != null && grid.p.onBeforeNavigationReloadButton != undefined && grid.p.onBeforeNavigationReloadButton.length > 0) {
        eval(grid.p.onBeforeNavigationReloadButton);
    }
    qJqGrid_avviaRicerca(grid, url, 1, pagesize, "", "");
    return;
}


/************************************************************************
*****   TECLA NAVISION   ************************************************
************************************************************************/
var teclaNavision=teclaNavision || {};

//RAPPORTINI
teclaNavision.rappo=(function($,_window){
	//-----------------   private methods   -----------------
	var _R,
		_tableRappo,	//jQuery variable of rapportini DOM table
		_data,	/*array of "rapportini" records retrieved from server
					ex:
						...
						{
							"Key":"32;fbBMAACJ/1JBUC0yMS80OTEyOQAAhxAn10;36466116100;",
							"Numero":"RAP-21/49129",
							"Riga":"10000",
							"PSPLineNo":"0",
							"GoBackOnSuccess":"False",
							"CopiaDaLineNo":"",
							"Data":"04/10/2021 00:00:00",
							"NrCommessa":"N219088",
							"CodiceFaseLavoro":"CONSULENZA",
							"DexFaseLavoro":"E+G AM",
							"CodiceFase":"002",
							"OreOrdinarie":"1.75",
							"OreStraordinarie":"0",
							"OreReperibilita":"0",
							"KmPercorsi":"0",
							"Targa":"",
							"LuogoPartenza":"",
							"LuogoDestinazine":"",
							"LuogoAttivita":"Interna",
							"TipoTrasferta":"Italia",
							"Note":"ELEGANTB2B-1265 Geo-blocking translations store-checker",
							"LuogoAttivitaList":"System.Collections.Generic.Dictionary`2[System.String,System.String]",
							"TipoTrasfertaList":"System.Collections.Generic.Dictionary`2[System.String,System.String]",
							"TargheList":"",
							"ImportoSpese":"0",
							"BancaOre":"0",
							"OreTrasferta":"0",
							"AttivaBancaOre":"False",
							"AttivaOreTrasferta":"False",
							"EmptyField":"",
							"AttivaReqAbailability":"False",
							"ReqAbailabilityOre":"0",
							"FromTime_String":"",
							"ToTime_String":"",
							"FromTimeStra_String":"",
							"ToTimeStra_String":"",
							"FromTimeIntRep_String":"",
							"ToTimeIntRep_String":"",
							"FromTimeOrd_String":"00:00",
							"ToTimeOrd_String":"00:00"
						},
						...
				*/
	
		//ADD COLUMN NOTE
		_addColumnNote=function(){
			//title
			$('#jqgh_listaRigheOdT_EmptyField').prepend('Note');
			var colsTitle=$('[id="listaRigheOdT_EmptyField"]'),
				totWidth=0,
				col;
				colNoteRemoved=0;
			for (var i=0;i<colsTitle.length;i++){
				col=$(colsTitle[i]);
				totWidth+=col.width();
			}
			$(colsTitle[0])
			.width(totWidth);
			for (var i=1;i<colsTitle.length;i++){
				$(colsTitle[i]).remove();
				colNoteRemoved++;
			}
		
			//rows
			var rows=_tableRappo.find('tr');
			rows.each(function(index){
				var row=$(this),
					rowId=row.attr('id'),
					colsEmpty=row.find('[aria-describedby="listaRigheOdT_EmptyField"]'),
					col,
					note='';
					
				//first fake row (used for width, I presume)
				if (row.hasClass('jqgfirstrow')){
					colsEmpty=row.find('td');
					
					$(colsEmpty[(colsEmpty.length - colNoteRemoved)-1])
					.width(totWidth);
					for (var i=0;i<=colNoteRemoved;i++){
						$(colsEmpty[colsEmpty.length - colNoteRemoved])
						.remove();
					}

				//row rapportino
				}else{
					//find the "Note" value
					for (var i=0;i<_data.length;i++){
						if (_data[i].Riga==rowId){
							note=_data[i].Note;
							break;
						}
					}
					//update column
					for (var i=0;i<colsEmpty.length;i++){
						col=$(colsEmpty[i]);
						if (i===0){
							col.css({
								'background':'#009688',
								'text-align':'left',
								'white-space':'normal',
								'color':'white'
							})
							.html(note);
						}else{
							//col.hide();
							col.remove();
						}
					}
					$(colsEmpty[0])
					.width(totWidth);
				}
			});

		},
	
		//TOTALIZE HOURS BY DAY
		_showTotalHours=function(){
			var rows=_tableRappo.find('tr:not(.jqgfirstrow)'),
				ggOld='',
				hoursTot=0,
				previousColHoursTot,
				totalizePreviousDay=function(hoursTotal,colHoursToUpdate){	//aggiorno il totale ore precedente
					var totEl=colHoursToUpdate.find('.totHours');
					if (!totEl.length){
						totEl=$('<div/>',{'class':'totHours','style':'font-weight:bold;font-size:16px;text-align: left;'})
								.appendTo(colHoursToUpdate);
					}
					
					totEl
					.html(hoursTotal)
					.css('color',hoursTotal>8 ? 'black' : hoursTotal===8 ? 'green' : 'red');
					colHoursToUpdate.parents('tr').css('border-bottom','3px solid #000');
				};

			rows.each(function(index){
				var row=$(this),
					cols=row.find('td'),
						colDay=cols.filter('[aria-describedby=listaRigheOdT_Data]'),
					colHours=cols.filter('[aria-describedby=listaRigheOdT_OreOrdinarie]'),
					gg=colDay.html(),
					hours=+colHours.html().replace(',','.'),
					isLastRow=rows.length==index+1;
					
				//AGGIORNAMENTO RIGHE PRECEDENTI
				if ((gg!==ggOld && ggOld) || isLastRow){
					if (gg!==ggOld && ggOld){
						totalizePreviousDay(hoursTot,previousColHoursTot);
						hoursTot=0;
					}
					if (isLastRow){
						hoursTot+=hours;
						previousColHoursTot=cols.filter('[aria-describedby=listaRigheOdT_OreStraordinarie]');
						totalizePreviousDay(hoursTot,previousColHoursTot);
					}
				}
				
				//IDENTIFICAZIONE RIGA ATTUALE
				if (gg===ggOld){
					if (!isLastRow){
						hoursTot+=hours;
					}

				}else{
					ggOld=gg;
					hoursTot=hours;	//conteggio nuovo totale ore
				}
				previousColHoursTot=cols.filter('[aria-describedby=listaRigheOdT_OreStraordinarie]');
			});
		},

		//
		_xxxxx2=function(xxx){
			/*Input parameters:
				xxx		= [optional] xxx
			Return value:	
			*/
/*TODO
*/

		};


		//INITIALIZATION
		$(document).ready(function(){

			//MESSAGE EXTRA FUNCTIONS ACTIVATED
			var message=$('<a/>',{
						'id':'teclaNavisionMessage',
						'href':'https://github.com/asamorini/navision.rappo'
					})
					.css({
						'-moz-transition':		'all 1s ease-in',
						'-webkit-transition':	'all 1s ease-in',
						'-o-transition':		'all 1s ease-in',
						'transition':			'all 1s ease-in',
						'background':			'#eeeeee',
						'border-radius':		'16px',
						'padding':				'5px 10px',
						'color': 				'#d22020',
						'font-size':			'12px',
					})
				,messageContainer=$('<div/>',{'style':'text-align: right;position: absolute;transition: all 2s ease-out 0s;right: 10px;bottom: calc(100% - -50px)'});
			$('#accordionMenu .ui-accordion-content')
			.append(
				messageContainer.append(message.html('Tecla plugin enabled'))
			);
			//"version" highlight effect: START
			message=$('#teclaNavisionMessage');
			messageContainer=message.parent('div');
			setTimeout(function(){
				message.css({'background':'#a3ede6'});
				messageContainer.css({'bottom':'10px'});
				//"version" highlight effect: END
				setTimeout(function(){
					message.css({'color':'#d22020','background':'#eeeeee'});
				},1500);
			},1000);
			
		});

	//-----------------   public methods   -----------------
	return{

		MAX_ROWS_NUMBER:120,

		//ADJUST RAPPORTINI
		tableRappoAdjust:function(tableRappo,obj){
			/*Input parameters:
				tableRappo	= table rapportini
				obj			= JSON object with rapportini retrieved from server
			*/
			if (!obj || !obj.Oggetti){return;}
			console.log('tableRappoAdjust',obj);

			_R=teclaNavision.rappo;
			_tableRappo=tableRappo;
			
			//there is only one page of rows
			if ($('#listaRigheOdT_btnPrev').is(':disabled')
			   && $('#listaRigheOdT_btnNext').is(':disabled')){
				_data=obj.Oggetti;
				_addColumnNote(obj);
				_showTotalHours();
				_tableRappo.show();
				
			//there are many pages of rows (so we retrieve all)
			}else{
				console.log('tableRappoAdjust many pages, so we retrieve morre rows',_R.MAX_ROWS_NUMBER);
				_tableRappo.hide();
				
				//set new total rows number per page
				listaRigheOdT.p.rowNum=_R.MAX_ROWS_NUMBER;

				//refresh
				qJqGrid_firstPage(listaRigheOdT);
			}
		},

		//
		xxx:function(name){
			/*Input parameters
				xxx	= 
			Return value:	
			*/
			return true;
		}
	};
})(jQuery,window);


/*OLD VERSION
var label = $("#listaRigheOdT_situazionePaging");
var LOADINGTXT = " (LOADING)";
//there is only one page of rows
if ($('#listaRigheOdT_btnPrev').is(':disabled')
   && $('#listaRigheOdT_btnNext').is(':disabled')){
	teclaNavisionRappo.showTotalHours();
	
//there are many pages of rows (so we retrieve all)
}else{
	label.append(LOADINGTXT);
	//set new total rows number per page
	listaRigheOdT.p.rowNum= 120;
	//refresh
	qJqGrid_firstPage(listaRigheOdT);
	//verifico ciclicamente che l'aggiornamneto della tabella sia completato
	//monitrando il testo della label
	var timer = setInterval( function() {
		if(label.html().indexOf(LOADINGTXT)=== -1){
			clearInterval(timer);
			teclaNavisionRappo.showTotalHours();
		}
	}, 200);
}
*/
