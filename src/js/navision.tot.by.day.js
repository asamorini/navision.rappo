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
