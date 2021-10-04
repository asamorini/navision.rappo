var label = $("#listaRigheOdT_situazionePaging");
var LOADINGTXT = " (LOADING)";


/*OLD VERSION
//add column note if not present
if (!$('#listaRigheOdT_Note').length){
	addColumnNote_OLD_RECONFIGURING_jqGrid();
}
*/

//there is only one page of rows
if (jQuery('#listaRigheOdT_btnPrev').is(':disabled')
   && jQuery('#listaRigheOdT_btnNext').is(':disabled')){
	showTotalHours();
	
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
			showTotalHours();
		}
	}, 200);
}



function showTotalHours(){
	var rows=jQuery('#listaRigheOdT tr:not(.jqgfirstrow)'),
		ggOld='',
		hoursTot=0,
		previousColHoursTot,
		alternateBackground=true,
			totalizePreviousDay=function(hoursTotal,colHoursToUpdate){	//aggiorno il totale ore precedente
			var totEl=colHoursToUpdate.find('.totHours');
			if (!totEl.length){
				totEl=jQuery('<div/>',{'class':'totHours','style':'font-weight:bold;font-size:16px;text-align: left;'})
						.appendTo(colHoursToUpdate);
			}
			
			totEl
			.html(hoursTotal)
			.css('color',hoursTotal>8 ? 'black' : hoursTotal===8 ? 'green' : 'red');
			colHoursToUpdate.parents('tr').css('border-bottom','3px solid #000');
		};

	rows.each(function(index){
		var row=jQuery(this),
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
			alternateBackground=!alternateBackground;
		}
		/*
		if (alternateBackground){
			colHours
			.add(colDay)
			.css('background','#ffeded');
		}
		*/
		previousColHoursTot=cols.filter('[aria-describedby=listaRigheOdT_OreStraordinarie]');
	});
}

function addColumnNote_OLD_RECONFIGURING_jqGrid(){
//	$('#listaRigheOdT').clearGridData(true);
	$("#listaRigheOdT").jqGrid('GridUnload');

	jQuery('#listaRigheOdT').jqGrid({
		ajaxUrl:listaRigheOdtUrl,
		showAjaxLoadingText:true, 
		elementContainer:'listaRigheOdT_container', 
		lastColumnGridFit:'false', 
		onAjaxErrorScript:'manageAjaxErrorJsonResult(msg.exMessage);', 
		onErrorScript:'manageAjaxError(event, request, options);', 
		onSuccessScript:'loadRigheSuccess();', 
		onBeforeAjaxLoadFunction:'qClearErrorGrid();', 
		caption:'Consuntivazioni relative a questo Rapportino',
		datatype:'local',
		jsonReader:{'repeatitems':false, 'id': 'Riga', 'root': 'Oggetti', 'page': 'CurrentPage', 'total': 'TotalPages', 'records': 'TotalRecords'},
		emptyrecords:'Nessun riga ordine di trasferta presente.',
		height:400,
//		rowNum:15,
		rowNum:120,
		toolbar:[true,'top'],
		viewrecords:true,
		width: 97,
		percentagewidth: 97,
		ajaxParms: [
		{odtno:'$("#OdTNo_h").val()',da:'$("#dateFrom").val()',a:'$("#dateTo").val()',commessa:'$("#nrCommessa").val()',fase:'$("#nrFase").val()',luogoAttivita:'$("#luogoAttivita").val()'}
		],
		colNames: [
		'Riga','Data','Commessa','Fase','CodiceFaseLavoro','Descrizione','Ore','Straordin.','Int.Rep.','Banca Ore','Ore Viaggio','Ore Rep.','Importo Spese','Note'
		//,'',''
		],
		colModel: [
		{
			name:'Riga',
			hidden:true,
			sortable:false,
			index:'Riga'
		},{
			classes:'pointer',
			name:'Data',
			formatter:'date', formatoptions: {srcformat: 'd/m/Y H.i.s', newformat: 'd/m/Y'},
			sortable:false,
			width:8,
			percentagewidth:8,
			index:'Data'
		},{
			classes:'pointer',
			name:'NrCommessa',
			sortable:false,
			width:8,
			percentagewidth:8,
			index:'NrCommessa'
		},{
			classes:'pointer',
			name:'CodiceFase',
			sortable:false,
			width:5,
			percentagewidth:5,
			index:'CodiceFase'
		},{
			name:'CodiceFaseLavoro',
			hidden:true,
			sortable:false,
			index:'CodiceFaseLavoro'
		},{
			classes:'pointer',
			name:'DexFaseLavoro',
			sortable:false,
			width:23,
			percentagewidth:23,
			index:'DexFaseLavoro'
		},{
			align:'right',
			classes:'pointer',
			name:'OreOrdinarie',
			formatter:'number',
			sortable:false,
			width:6,
			percentagewidth:6,
			index:'OreOrdinarie'
		},{
			align:'right',
			classes:'pointer',
			name:'OreStraordinarie',
			formatter:'number',
			sortable:false,
			width:7,
			percentagewidth:7,
			index:'OreStraordinarie'
		},{
			align:'right',
			classes:'pointer',
			name:'OreReperibilita',
			formatter:'number',
			sortable:false,
			width:9,
			percentagewidth:9,
			index:'OreReperibilita'
		},{
			align:'right',
			classes:'pointer',
			name:'BancaOre',
			formatter:'number',
			hidden:true,
			sortable:false,
			width:8,
			percentagewidth:8,
			index:'BancaOre'
		},{
			align:'right',
			classes:'pointer',
			name:'OreTrasferta',
			formatter:'number',
			hidden:true,
			sortable:false,
			width:8,
			percentagewidth:8,
			index:'OreTrasferta'
		},{
			align:'right',
			classes:'pointer',
			name:'ReqAbailabilityOre',
			formatter:'number',
			hidden:true,
			sortable:false,
			width:8,
			percentagewidth:8,
			index:'ReqAbailabilityOre'
		},{
			align:'right',
			classes:'pointer',
			name:'ImportoSpese',
			formatter:'currency', formatoptions: {prefix:'€'},
			sortable:false,
			width:10,
			percentagewidth:10,
			index:'ImportoSpese'
		},

			//NEW COLUMN "NOTE"
			{
			classes:'pointer',
			name:'Note',
			sortable:false,
			width:24,
			percentagewidth:24,
			index:'Note'
			}

		/*
		,{
		align:'right',
		classes:'pointer',
		name:'EmptyField',
		hidden:false,
		sortable:false,
		width:8,
		percentagewidth:8,
		index:'EmptyField'
		},{
		align:'right',
		classes:'pointer',
		name:'EmptyField',
		hidden:false,
		sortable:false,
		width:8,
		percentagewidth:8,
		index:'EmptyField'
		}
		*/
		]
	});
	//update the list
	$('#listaRigheOdT').setGridParam({datatype:'json'});
//	qJqGrid_reloadPage(listaRigheOdT);
//	qJqGrid_resize('listaRigheOdT');


/*
$('#t_listaRigheOdT:not(:has(#listaRigheOdT_navPagerAndButtonDiv))').prepend("<div id='listaRigheOdT_navPagerAndButtonDiv'><div><button id='listaRigheOdT_btnPrev' onclick='qJqGrid_previousPage(listaRigheOdT)' type='button' style='height:30px'>Precedente</button>&nbsp;<button id='listaRigheOdT_btnNext' onclick='qJqGrid_nextPage(listaRigheOdT)' type='button' style='height:30px;font-size:-2'>Successiva</button>&nbsp;<label style='width:300px; font-size:smaller' id='listaRigheOdT_situazionePaging'></label></div><div style='clear:both;' /><div style='margin-top:5px;'><button id='listaRigheOdT_btnNew' onclick='listaRigheOdT_New()' type='button' style='height:30px'>Nuovo</button>&nbsp;<button id='listaRigheOdT_btnEdit'  onclick='listaRigheOdT_Edit()' type='button' style='height:30px'>Modifica</button>&nbsp;<button id='listaRigheOdT_btnCopy' onclick='listaRigheOdT_Copy()' type='button' style='height:30px'>Copia</button>&nbsp;<button id='listaRigheOdT_btnDelete' onclick='listaRigheOdT_Delete()' type='button' style='height:30px'>Elimina</button>&nbsp;<label id='Totali' >Tot.Spese: 0 - Tot.Ord.: 0 - Tot.Str.: 0 - Tot.Int.Rep.: 0 - Tot.Rep.: 0</label></div></div>");
$('#t_listaRigheOdT').css({ 'height': '70px', 'padding-top': '3px', 'padding-left': '3px', 'vertical-align': 'text-center', 'width': '94px' });
$("#listaRigheOdT_btnNew").button({ icons: { primary: 'ui-icon-plus'} });
$("#listaRigheOdT_btnEdit").button({ icons: { primary: 'ui-icon-pencil'} });
$("#listaRigheOdT_btnCopy").button({ icons: { primary: 'ui-icon-copy'} });
$("#listaRigheOdT_btnDelete").button({ icons: { primary: 'ui-icon-trash'} });
$("#listaRigheOdT_btnPrev").button({ icons: { primary: 'ui-icon-circle-triangle-w'} });
$("#listaRigheOdT_btnPrev").button("option", "disabled", true);
$("#listaRigheOdT_btnNext").button({ icons: { secondary: 'ui-icon-circle-triangle-e'} });
$("#listaRigheOdT_btnNext").button("option", "disabled", true);
*/

//TODO
	//adjust "Note" column layout
	jQuery('[aria-describedby="listaRigheOdT_Note"]').css({'white-space':'normal','color':'green'})
	
	
	showTotalHours();
}


//OVERWRITE OF NAVISION FUNCTION
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
	
	//ADD COLUMN NOTE
	var tabellaRappo=jQuery('#listaRigheOdT');
	if (tabellaRappo.length && obj && obj.Oggetti){	//se siamo nella lista dei rapportini
       listaRigheOdT_EmptyField
		//title
		jQuery('#jqgh_listaRigheOdT_EmptyField').prepend('Note')
		var colsTitle=$('[id="listaRigheOdT_EmptyField"]'),
			totWidth=0,
			col;
			colNoteRemoved=0;
		for (var i=0;i<colsTitle.length;i++){
			col=jQuery(colsTitle[i]);
			totWidth+=col.width();
		}
		jQuery(colsTitle[0])
		.width(totWidth);
//		.attr('colspan',3);
		for (var i=1;i<colsTitle.length;i++){
			//jQuery(colsTitle[i]).hide();
			jQuery(colsTitle[i]).remove();
			colNoteRemoved++;
		}
		//first fake row (used for width, I presume)
/*
		totWidth
		jQuery('#listaRigheOdT tr.jqgfirstrow td')
		.each(function(index){
			if ()
			colNoteRemoved
			;
		});
		
*/	
		//rows
		var rows=jQuery('#listaRigheOdT tr');
		rows.each(function(index){
			var row=jQuery(this),
				rowId=row.attr('id'),
				colsEmpty=row.find('[aria-describedby="listaRigheOdT_EmptyField"]'),
				col,
				note='';
				
			//first fake row (used for width, I presume)
			if (row.hasClass('jqgfirstrow')){
				colsEmpty=row.find('td');
				
				jQuery(colsEmpty[(colsEmpty.length - colNoteRemoved)-1])
				.width(totWidth);
				for (var i=0;i<=colNoteRemoved;i++){
					jQuery(colsEmpty[colsEmpty.length - colNoteRemoved])
					.remove();
				}

			//row rapportino
			}else{
				//find the "Note" value
				for (var i=0;i<obj.Oggetti.length;i++){
					if (obj.Oggetti[i].Riga==rowId){
						note=obj.Oggetti[i].Note;
						break;
					}
				}
				//update column
				for (var i=0;i<colsEmpty.length;i++){
					col=jQuery(colsEmpty[i]);
					if (i===0){
						col.css({
							'text-align':'left',
							'white-space':'normal',
							'color':'green'
						})
						.html(note);
					}else{
						//col.hide();
						col.remove();
					}
				}
				jQuery(colsEmpty[0])
				.width(totWidth);
			}
		});
	}
	
	//ORIGINAL CODE
    obj = null;
    return;
}
