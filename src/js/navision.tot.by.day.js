var teclaNavisionRappo=teclaNavisionRappo || {};
(function($){
	
	//ADD COLUMN NOTE
	teclaNavisionRappo.addColumnNote=function(obj){
		var tabellaRappo=$('#listaRigheOdT');
		if (tabellaRappo.length && obj && obj.Oggetti){	//se siamo nella lista dei rapportini
		   listaRigheOdT_EmptyField
			//title
			$('#jqgh_listaRigheOdT_EmptyField').prepend('Note')
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
	//		.attr('colspan',3);
			for (var i=1;i<colsTitle.length;i++){
				//$(colsTitle[i]).hide();
				$(colsTitle[i]).remove();
				colNoteRemoved++;
			}
		
			//rows
			var rows=$('#listaRigheOdT tr');
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
					for (var i=0;i<obj.Oggetti.length;i++){
						if (obj.Oggetti[i].Riga==rowId){
							note=obj.Oggetti[i].Note;
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
		}
	};
	

	//TOTALIZE HOURS OF RAPPORTINI BY DAY
	teclaNavisionRappo.showTotalHours=function(){
		var rows=$('#listaRigheOdT tr:not(.jqgfirstrow)'),
			ggOld='',
			hoursTot=0,
			previousColHoursTot,
			alternateBackground=true,
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
	};
	
	


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
	
})(jQuery);




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

	//TECLA CODE
	teclaNavisionRappo.addColumnNote(obj);
	teclaNavisionRappo.showTotalHours();
	
/*TODO
add a temporary div tha advise user that extra funcions are activated
*/
	
	//ORIGINAL CODE
    obj = null;
    return;
}
