/**
 * @param {THREE.Geometry} geometry
 */
let scope = this;
/**
 * @return {Array<THREE.Mesh>}
 */
function unfold(geometry) {
	scope.geometry = geometry;
	let faces = geometry.faces;
	// [ [f,f...] , [f,f...] ]
	let groupedFaces = groupBy(faces, (a, b)=> normalEqual(a, b) && connected(a, b) );
	let meshies = groupedFaces.map(g => makeMesh(g) );
	return meshies;
}
/**
 * @param {(function(THREE.Face3,THREE.Face3))} cb
 */
function groupBy(_array, cb){
	let groupedFaces = [];
	let set = new Set(_array);
	for(let a of set) {
		let subgroup = [ a ];

		for(let b of set) {
			if(a === b) continue;

			if(cb(a,b)) {
				subgroup.push( b );
				set.delete( b );
			}
		}
		groupedFaces.push(subgroup);
		set.delete(a);
	}

	return groupedFaces;
}

/**
 * @param {THREE.Face3} face_a
 * @param {THREE.Face3} face_aface_b
 */
function normalEqual( face_a, face_b ) {
	let n_a = face_a.normal.normalize();
	let n_b = face_b.normal.normalize()
	
	return n_a.equals( n_b );
}

/**
 * @param {THREE.Face3} face_a
 * @param {THREE.Face3} face_aface_b
 */
function connected( face_a, face_b ) {
// connected triangles have 2 same point.

	let a = [face_a.a, face_a.b, face_a.c];
	let count = 0;
	if(a.some(v => eq(v, face_b.a)) ) count++;
	if(a.some(v => eq(v, face_b.b)) ) count++;
	if(a.some(v => eq(v, face_b.c)) ) count++;

	return (count === 2);
}

function eq(a,b){
	let geometry = scope.geometry;

/**
 * @type {THREE.Vector3} vertex_1,vertex_2
 */
	let vertex_1 = geometry.vertices[a];
	let vertex_2 = geometry.vertices[b];

	return vertex_1.equals(vertex_2);
}

/**
 * @param {THREE.Face3[]} groupedFaces
 */

function makeMesh(groupedFaces){
	let geometry = scope.geometry;
	let unfold_face_geo = new THREE.Geometry();

	let vertices = groupedFaces.map(f=>
		[
			geometry.vertices[f.a], 
			geometry.vertices[f.b], 
			geometry.vertices[f.c],
			//f.normal.normalize().multiplyScalar(0.1)
		]
	)/*.map(f=>
		[
			f[0]+f[3],
			f[1]+f[3],
			f[2]+f[3],
		]
	)*/.reduce((a,b)=>
		a.concat(b)
	);

	unfold_face_geo.vertices = vertices;
	unfold_face_geo.faces=groupedFaces.map((_,i)=>new THREE.Face3(3*i, 3*i+1, 3*i+2));
/*
	let index=0;
	for(let f of groupedFaces){
		unfold_face_geo.vertices.push(
			geometry.vertices[f.a], 
			geometry.vertices[f.b], 
			geometry.vertices[f.c]
		);
		unfold_face_geo.faces.push(new THREE.Face3(index, index+1, index+2));
		index+=3;
	}
		*/
	let n = groupedFaces[0].normal.normalize().multiplyScalar(0.1);
	unfold_face_geo.translate(n.x, n.y, n.z);
	let material = new THREE.MeshBasicMaterial({
		color: Math.random() * 0xffffff, 
		side: THREE.DoubleSide
	});
	let mesh = new THREE.Mesh( unfold_face_geo, material );

	return mesh;
}
export default {unfold};