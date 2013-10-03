function Matrix(_id)
{
	var id = _id;
	this.data = [];
	console.debug(id+" constructing");
	var html = "";
	html +="<input type='number' id='"+id+"sizeInput' class='sizeInput'>";
	html +="<button id='"+id+"det' class='det'>det</button>";
	html +="<button id='"+id+"adj' class='adj'>adj</button>";
	html +="<button id='"+id+"invert' class='invert'>inv</button>";
	html +="<br>";
	html +="<div id='"+id+"matrix'class='matrix'></div>";
	html +="<div class='matrixHandle'></div>";
	$("#"+id).html(html);
	$("#"+id).draggable({ handle: ".matrixHandle" });
	$("#"+id).droppable({
		drop:function(event,ui)
		{
			id = this.id;
			console.debug(ui.draggable.attr('id')+" dropped on "+id);
			//$("#dialog").dialog("open");
			//var dialog = $("#dialog").get()[0];
			//dialog.dataset.a = ui.draggable.attr('id');
			//dialog.dataset.b = id;
			var aid = ui.draggable.attr('id');
			var bid = id;
			var newmatrix = createMatrix();
			matrices[newmatrix].data = matrix_mult(matrices[aid].data,matrices[bid].data);
			matrices[newmatrix].flushHTML();
		}
	});
	$("#"+id+"invert").click(function(){
		id = this.parentNode.id;
		console.debug(id+' find invert');
		matrices[id].data = matrix_invert(matrices[id].data);
		matrices[id].flushHTML();
	});
	$("#"+id+"det").click(function(){
		id = this.parentNode.id;
		console.debug(id+' find det');
		alert(matrix_det(matrices[id].data));
	});
	$("#"+id+"adj").click(function(){
		id = this.parentNode.id;
		console.debug(id+' find adj');
		matrices[id].data = matrix_adj(matrices[id].data);
		matrices[id].flushHTML();
	});
	$("#"+id+"sizeInput").change(function(){
		id = this.parentNode.id;
		console.debug(id+" change size");
		matrices[id].resize(this.value);
	});
	this.resize = function(newsize)
	{
		var toPop = matrices[id].data.length - newsize;
		if(toPop > 0)
		{
			console.debug("size decrease");
			for(var i=0;i<toPop;i++)matrices[id].data.pop();
			for(var i in matrices[id].data)
			{
				for(var j=0;j<toPop;j++)matrices[id].data[i].pop();
			}
			matrices[id].flushHTML();
		}
		if(toPop < 0)
		{
			console.debug("size increase");
			for(var i=0;i<newsize;i++)
			{
				if(i==matrices[id].data.length)matrices[id].data.push([]);
				for(var j=0;j<newsize;j++)
				{
					if(j==matrices[id].data[i].length)matrices[id].data[i].push(0);
				}
			}
			matrices[id].flushHTML();
		}
	}
	this.flushHTML = function()
	{
		var matrix = $("#"+id+"matrix");
		matrix.html('');
		var t = document.createElement("table");
		for(var i in matrices[id].data)
		{
			var trow = document.createElement("tr");
			for(var j in matrices[id].data[i])
			{
				var tdata = document.createElement("td");
				var input = document.createElement("input");
				input.className = "matrix-cell";
				input.type = "number";
				input.value = matrices[id].data[i][j];
				input.dataset.i = i;
				input.dataset.j = j;
				tdata.appendChild(input);
				trow.appendChild(tdata);
			}
			t.appendChild(trow);
		}
		matrix.append(t);
		$(".matrix-cell").change(function(){
			console.debug(id);
			matrices[id].data[this.dataset.i][this.dataset.j] = this.value;
			console.debug(id+" save on "+this.dataset.i+" "+this.dataset.j);
		});
	}
}

function matrix_mult(a,b)
{
	if(a.length != b.length)
	{
		alert("SIZE ERROR");
		return;
	}
	var size = a.length;

	var ret = new Array(size);
	for(i=0;i<size;i++)
	{
		ret[i] = new Array(size);
	}
	
	for(var i=0;i<size;i++)
	{
		for(var j=0;j<size;j++)
		{
			ret[i][j]=0;
			for(var k=0;k<size;k++)
			{
				ret[i][j] += a[i][k] * b[k][j];
				console.debug('i-'+i+" j-"+j)
				console.debug(a[i][k]+"x"+b[k][j]);
			}
			console.debug('='+ret[i][j]);
		}
	}
	return ret;
}
function matrix_invert(a)
{
	a = matrix_copy(a);
	var adj = matrix_adj(a);
	var det = matrix_det(a);
	for(var i=0;i<adj.length;i++)
	{
		for(var j=0;j<adj[i].length;j++)
		{
			adj[i][j] /= det;
		}
	}
	return adj;
}
function matrix_det(a)
{
	a = matrix_copy(a);
	console.debug('det');
	console.debug(a);
	if(a.length==0)return false;
	if(a.length != a[0].length)
	{
		alert("square matrix only");
		return false;
	}
	if(a.length == 1)return a[0][0];
	if(a.length == 2)
	{
		var ret = a[0][0]*a[1][1] - a[1][0]*a[0][1]
		console.debug('ret det 2*2');
		console.debug(ret);
		return ret;
	}
	var ret = 0;
	c = matrix_cofactor(a);
	for(var i=0;i<a.length;i++)
	{
		ret += a[0][i]*c[0][i];
	}
	console.debug('ret');
	console.debug(ret);
	return ret;
}
function matrix_cofactor(a)
{
	console.debug('cof');
	console.debug(a);
	var ret = matrix_copy(a);
	ret = matrix_minor(ret);
	console.debug(ret);
	for(var i=0;i<ret.length;i++)
	{
		for(var j=0;j<ret[i].length;j++)
		{
			ret[i][j] *= Math.pow(-1,i+j);
		}
	}
	console.debug('ret');
	console.debug(ret);
	return ret;
}
function matrix_minor(a)
{
	var ret = matrix_copy(a);
	console.debug('min');
	console.debug(a);
	for(var i=0;i<ret.length;i++)
	{
		for(var j=0;j<ret[i].length;j++)
		{
			b = matrix_copy(a);
			b.splice(i,1);
			for(var k=0;k<b.length;k++)
			{
				b[k].splice(j,1);
			}
			ret[i][j] = matrix_det(b);
		}
	}
	console.debug('ret');
	console.debug(ret);
	return ret;
}
function matrix_adj(a)
{
	a = matrix_copy(a);
	var ret = matrix_cofactor(a);
	ret = matrix_transpose(ret);
	return ret;
}
function matrix_transpose(a)
{
	a = matrix_copy(a);
	var ret = new Array(a[0].length);
	for(var i=0;i<ret.length;i++)
	{
		ret[i] = new Array(a.length);
		for(var j=0;j<ret[i].length;j++)
		{
			ret[i][j] = a[j][i];
		}
	}
	return ret;
}
function matrix_copy(a)
{
	var ret = new Array(a.length);
	for(var i=0;i<a.length;i++)
	{
		ret[i] = new Array(a[i].length);
		for(var j=0;j<a[i].length;j++)
		{
			ret[i][j] = a[i][j];
		}
	}
	return ret;
}