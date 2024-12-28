
let positions = [
	"\nposition: absolute;\nbackground-color: grey;\nleft: 132px;\ntop: 326px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 129px;\ntop: 294px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 132px;\ntop: 270px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 143px;\ntop: 249px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 150px;\ntop: 242px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 155px;\ntop: 233px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 155px;\ntop: 232px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 155px;\ntop: 232px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 156px;\ntop: 232px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 160px;\ntop: 233px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 168px;\ntop: 237px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 183px;\ntop: 241px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 196px;\ntop: 238px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 207px;\ntop: 230px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 211px;\ntop: 222px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 214px;\ntop: 207px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 213px;\ntop: 200px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 214px;\ntop: 200px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 217px;\ntop: 202px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 224px;\ntop: 206px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 234px;\ntop: 214px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 238px;\ntop: 219px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 239px;\ntop: 222px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 241px;\ntop: 224px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 248px;\ntop: 227px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 262px;\ntop: 231px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 270px;\ntop: 234px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 271px;\ntop: 234px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 271px;\ntop: 234px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 271px;\ntop: 231px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 272px;\ntop: 218px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 271px;\ntop: 210px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 270px;\ntop: 207px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 267px;\ntop: 203px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 260px;\ntop: 197px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 257px;\ntop: 195px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 247px;\ntop: 192px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 232px;\ntop: 190px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 212px;\ntop: 190px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 198px;\ntop: 190px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 186px;\ntop: 192px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 165px;\ntop: 192px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 151px;\ntop: 192px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 138px;\ntop: 192px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 130px;\ntop: 191px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 125px;\ntop: 190px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 123px;\ntop: 188px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 119px;\ntop: 183px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 117px;\ntop: 178px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 114px;\ntop: 172px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 113px;\ntop: 169px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 112px;\ntop: 167px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 111px;\ntop: 166px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 111px;\ntop: 165px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 110px;\ntop: 163px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 110px;\ntop: 163px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 108px;\ntop: 164px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 84px;\ntop: 177px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 65px;\ntop: 189px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 43px;\ntop: 206px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 42px;\ntop: 209px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 47px;\ntop: 219px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 56px;\ntop: 233px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 70px;\ntop: 249px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 80px;\ntop: 257px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 86px;\ntop: 260px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 86px;\ntop: 261px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 86px;\ntop: 267px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 78px;\ntop: 273px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 78px;\ntop: 273px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 84px;\ntop: 276px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 104px;\ntop: 282px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 96px;\ntop: 289px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 63px;\ntop: 303px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 63px;\ntop: 304px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 78px;\ntop: 308px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 105px;\ntop: 313px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 108px;\ntop: 315px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 106px;\ntop: 316px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 106px;\ntop: 318px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 120px;\ntop: 327px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 142px;\ntop: 334px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 142px;\ntop: 335px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 141px;\ntop: 336px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 141px;\ntop: 337px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 142px;\ntop: 338px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 276px;\ntop: 270px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 236px;\ntop: 255px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 234px;\ntop: 254px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 234px;\ntop: 254px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 237px;\ntop: 259px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 242px;\ntop: 266px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 246px;\ntop: 271px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 246px;\ntop: 271px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 248px;\ntop: 266px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 247px;\ntop: 249px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 235px;\ntop: 233px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 201px;\ntop: 213px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 186px;\ntop: 209px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 180px;\ntop: 210px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 169px;\ntop: 215px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 161px;\ntop: 220px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 161px;\ntop: 228px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 166px;\ntop: 234px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 171px;\ntop: 234px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 174px;\ntop: 219px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 163px;\ntop: 194px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 141px;\ntop: 177px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 94px;\ntop: 160px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 93px;\ntop: 161px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 95px;\ntop: 180px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 110px;\ntop: 195px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 127px;\ntop: 194px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 144px;\ntop: 172px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 148px;\ntop: 149px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 147px;\ntop: 133px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 146px;\ntop: 120px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 148px;\ntop: 109px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 166px;\ntop: 96px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 196px;\ntop: 87px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 229px;\ntop: 84px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 247px;\ntop: 89px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 255px;\ntop: 95px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 258px;\ntop: 98px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 263px;\ntop: 103px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 268px;\ntop: 105px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 275px;\ntop: 103px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 286px;\ntop: 93px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 287px;\ntop: 82px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 279px;\ntop: 69px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 266px;\ntop: 63px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 241px;\ntop: 57px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 221px;\ntop: 56px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 212px;\ntop: 61px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 209px;\ntop: 69px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 207px;\ntop: 77px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 208px;\ntop: 85px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 211px;\ntop: 90px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 217px;\ntop: 99px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 230px;\ntop: 108px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 246px;\ntop: 118px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 265px;\ntop: 128px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 280px;\ntop: 135px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 292px;\ntop: 140px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 308px;\ntop: 151px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 319px;\ntop: 161px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 327px;\ntop: 177px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 326px;\ntop: 182px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 316px;\ntop: 194px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 307px;\ntop: 202px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 297px;\ntop: 209px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 292px;\ntop: 211px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 289px;\ntop: 212px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 289px;\ntop: 212px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 289px;\ntop: 213px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 289px;\ntop: 221px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 292px;\ntop: 233px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 298px;\ntop: 248px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 299px;\ntop: 251px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 301px;\ntop: 256px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 302px;\ntop: 261px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 301px;\ntop: 262px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 300px;\ntop: 263px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 299px;\ntop: 264px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 298px;\ntop: 267px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 298px;\ntop: 273px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 300px;\ntop: 286px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 302px;\ntop: 290px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 304px;\ntop: 291px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 304px;\ntop: 292px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 305px;\ntop: 292px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 305px;\ntop: 292px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 305px;\ntop: 293px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 307px;\ntop: 304px;\n",
	"\nposition: absolute;\nbackground-color: grey;\nleft: 315px;\ntop: 336px;\n"
]
let positions_2 = [
	"\nposition: absolute;\nbackground-color: pink;\nleft: 253px;\ntop: 301px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 266px;\ntop: 290px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 269px;\ntop: 288px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 267px;\ntop: 275px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 251px;\ntop: 244px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 226px;\ntop: 196px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 216px;\ntop: 180px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 202px;\ntop: 163px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 179px;\ntop: 150px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 168px;\ntop: 149px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 159px;\ntop: 159px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 141px;\ntop: 179px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 134px;\ntop: 205px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 153px;\ntop: 227px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 196px;\ntop: 244px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 229px;\ntop: 236px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 233px;\ntop: 228px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 238px;\ntop: 219px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 243px;\ntop: 209px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 254px;\ntop: 186px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 264px;\ntop: 168px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 282px;\ntop: 149px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 299px;\ntop: 141px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 314px;\ntop: 138px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 327px;\ntop: 138px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 329px;\ntop: 138px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 331px;\ntop: 140px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 331px;\ntop: 140px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 328px;\ntop: 136px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 322px;\ntop: 125px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 312px;\ntop: 111px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 296px;\ntop: 87px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 281px;\ntop: 73px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 279px;\ntop: 72px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 275px;\ntop: 72px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 254px;\ntop: 75px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 228px;\ntop: 78px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 206px;\ntop: 79px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 191px;\ntop: 77px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 172px;\ntop: 71px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 162px;\ntop: 67px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 152px;\ntop: 60px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 141px;\ntop: 55px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 126px;\ntop: 51px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 114px;\ntop: 51px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 106px;\ntop: 56px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 92px;\ntop: 69px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 86px;\ntop: 79px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 85px;\ntop: 88px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 86px;\ntop: 95px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 100px;\ntop: 107px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 108px;\ntop: 113px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 113px;\ntop: 121px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 113px;\ntop: 133px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 96px;\ntop: 157px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 87px;\ntop: 166px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 81px;\ntop: 172px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 75px;\ntop: 182px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 67px;\ntop: 200px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 63px;\ntop: 216px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 66px;\ntop: 238px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 70px;\ntop: 251px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 74px;\ntop: 261px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 77px;\ntop: 269px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 81px;\ntop: 284px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 87px;\ntop: 303px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 98px;\ntop: 321px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 106px;\ntop: 326px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 131px;\ntop: 332px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 147px;\ntop: 335px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 152px;\ntop: 335px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 160px;\ntop: 336px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 160px;\ntop: 336px;\n",
	"\nposition: absolute;\nbackground-color: pink;\nleft: 167px;\ntop: 343px;\n"
]


let style = mem(() => `
position: absolute;
background-color: green;
left: ${M.vect.x}px;
top: ${M.vect.y}px;
`)

let mul = mem(() => M.a * 2)
let last_update = Date.now()

let styles = []
let iterations = 0

function createElement(sty) {
	let n = document.createElement("div")

	n.style = sty
	n.innerText = "hellso"

	document.body.appendChild(n)
}

positions.forEach((st) => {
	console.log(st)
	createElement(st)
})

positions_2.forEach((st) => {
	console.log(st)
	createElement(st)
})


eff(() => {
	if (Date.now() - last_update > mul()) {
		last_update = Date.now()
		iterations++

		createElement(style())
		styles.push(style())
		if (iterations > 20) {
			iterations = 0
			console.log(styles)

		}

	}
	console.log(M.vect.x, "x")
	console.log(M.vect.y, "y")
})

render(() => html`p [style=${style}] -- hello`, document.body)



























