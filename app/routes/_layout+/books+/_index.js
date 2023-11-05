'use strict';
var __awaiter =
	(this && this.__awaiter) ||
	function (thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P
				? value
				: new P(function (resolve) {
						resolve(value);
				  });
		}
		return new (P || (P = Promise))(function (resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator['throw'](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done
					? resolve(result.value)
					: adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	};
var __generator =
	(this && this.__generator) ||
	function (thisArg, body) {
		var _ = {
				label: 0,
				sent: function () {
					if (t[0] & 1) throw t[1];
					return t[1];
				},
				trys: [],
				ops: [],
			},
			f,
			y,
			t,
			g;
		return (
			(g = { next: verb(0), throw: verb(1), return: verb(2) }),
			typeof Symbol === 'function' &&
				(g[Symbol.iterator] = function () {
					return this;
				}),
			g
		);
		function verb(n) {
			return function (v) {
				return step([n, v]);
			};
		}
		function step(op) {
			if (f) throw new TypeError('Generator is already executing.');
			while ((g && ((g = 0), op[0] && (_ = 0)), _))
				try {
					if (
						((f = 1),
						y &&
							(t =
								op[0] & 2
									? y['return']
									: op[0]
									? y['throw'] || ((t = y['return']) && t.call(y), 0)
									: y.next) &&
							!(t = t.call(y, op[1])).done)
					)
						return t;
					if (((y = 0), t)) op = [op[0] & 2, t.value];
					switch (op[0]) {
						case 0:
						case 1:
							t = op;
							break;
						case 4:
							_.label++;
							return { value: op[1], done: false };
						case 5:
							_.label++;
							y = op[1];
							op = [0];
							continue;
						case 7:
							op = _.ops.pop();
							_.trys.pop();
							continue;
						default:
							if (
								!((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
								(op[0] === 6 || op[0] === 2)
							) {
								_ = 0;
								continue;
							}
							if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
								_.label = op[1];
								break;
							}
							if (op[0] === 6 && _.label < t[1]) {
								_.label = t[1];
								t = op;
								break;
							}
							if (t && _.label < t[2]) {
								_.label = t[2];
								_.ops.push(op);
								break;
							}
							if (t[2]) _.ops.pop();
							_.trys.pop();
							continue;
					}
					op = body.call(thisArg, _);
				} catch (e) {
					op = [6, e];
					y = 0;
				} finally {
					f = t = 0;
				}
			if (op[0] & 5) throw op[1];
			return { value: op[0] ? op[1] : void 0, done: true };
		}
	};
Object.defineProperty(exports, '__esModule', { value: true });
exports.ErrorBoundary = exports.loader = exports.action = exports.meta = void 0;
var zod_1 = require('@conform-to/zod');
var cuid2_1 = require('@paralleldrive/cuid2');
var react_icons_1 = require('@radix-ui/react-icons');
var node_1 = require('@remix-run/node');
var react_1 = require('@remix-run/react');
var index_ts_1 = require('~/core/components/booksIndexComponents/index.ts');
var index_ts_2 = require('~/core/server/index.ts');
var index_ts_3 = require('~/shared/lib/utils/index.ts');
var DeleteBookSchema_ts_1 = require('~/shared/schemas/DeleteBookSchema/DeleteBookSchema.ts');
var index_ts_4 = require('~/shared/ui/index.ts');
var meta = function () {
	return [
		{ title: 'Books collection | Geek Console' },
		{ name: 'description', content: 'Your full books collection' },
	];
};
exports.meta = meta;
function Books() {
	var allBooks = (0, react_1.useLoaderData)().allBooks;
	return (
		<>
			{allBooks && allBooks.length > 0 ? (
				<div className="grid grid-cols-5 gap-4">
					{allBooks.map(function (book) {
						return <index_ts_1.BookCard key={book.id} book={book} />;
					})}
				</div>
			) : (
				<div className="flex flex-col items-center justify-center">
					<p>There are no books to display.</p>
					<index_ts_4.Button asChild variant="link">
						<react_1.Link to="/books/new" prefetch="intent">
							Add your own
						</react_1.Link>
					</index_ts_4.Button>
				</div>
			)}
		</>
	);
}
exports.default = Books;
var action = function (_a) {
	var request = _a.request;
	return __awaiter(void 0, void 0, void 0, function () {
		var formData, submission, bookId, book, toastCookieSession, _b, _c, _d;
		var _e, _f;
		return __generator(this, function (_g) {
			switch (_g.label) {
				case 0:
					return [4 /*yield*/, request.formData()];
				case 1:
					formData = _g.sent();
					return [
						4 /*yield*/,
						(0, index_ts_2.validateCSRF)(formData, request.headers),
					];
				case 2:
					_g.sent();
					submission = (0, zod_1.parse)(formData, {
						schema: DeleteBookSchema_ts_1.DeleteBookFormSchema,
					});
					if (submission.intent !== 'submit') {
						return [
							2 /*return*/,
							(0, node_1.json)({ status: 'idle', submission: submission }),
						];
					}
					if (!submission.value) {
						return [
							2 /*return*/,
							(0, node_1.json)(
								{ status: 'error', submission: submission },
								{ status: 400 },
							),
						];
					}
					bookId = submission.value.bookId;
					return [
						4 /*yield*/,
						index_ts_2.prisma.book.findFirst({
							select: { id: true },
							where: { id: bookId },
						}),
					];
				case 3:
					book = _g.sent();
					(0, index_ts_3.invariantResponse)(book, 'Not found', { status: 404 });
					return [
						4 /*yield*/,
						index_ts_2.prisma.book.delete({ where: { id: book.id } }),
					];
				case 4:
					_g.sent();
					return [
						4 /*yield*/,
						index_ts_2.toastSessionStorage.getSession(
							request.headers.get('cookie'),
						),
					];
				case 5:
					toastCookieSession = _g.sent();
					toastCookieSession.flash('toast', {
						id: (0, cuid2_1.createId)(),
						type: 'success',
						title: 'Book deleted',
						description: 'Your book has been deleted',
					});
					_b = node_1.redirect;
					_c = ['/books'];
					_e = {};
					_f = {};
					_d = 'set-cookie';
					return [
						4 /*yield*/,
						index_ts_2.toastSessionStorage.commitSession(toastCookieSession),
					];
				case 6:
					return [
						2 /*return*/,
						_b.apply(
							void 0,
							_c.concat([((_e.headers = ((_f[_d] = _g.sent()), _f)), _e)]),
						),
					];
			}
		});
	});
};
exports.action = action;
var loader = function (args) {
	return __awaiter(void 0, void 0, void 0, function () {
		var allBooks;
		return __generator(this, function (_a) {
			switch (_a.label) {
				case 0:
					return [4 /*yield*/, index_ts_2.prisma.book.findMany()];
				case 1:
					allBooks = _a.sent();
					return [2 /*return*/, (0, node_1.json)({ allBooks: allBooks })];
			}
		});
	});
};
exports.loader = loader;
var ErrorBoundary = function () {
	return (
		<index_ts_4.GeneralErrorBoundary
			statusHandlers={{
				401: function () {
					return (
						<index_ts_4.Alert variant="destructive" className="w-2/4">
							<react_icons_1.ExclamationTriangleIcon className="h-4 w-4" />
							<index_ts_4.AlertTitle>Unauthorized</index_ts_4.AlertTitle>
							<index_ts_4.AlertDescription>
								You must be logged in to view your books.
								<index_ts_4.Button asChild variant="link">
									<react_1.Link to="/auth?type=signin">Login</react_1.Link>
								</index_ts_4.Button>
							</index_ts_4.AlertDescription>
						</index_ts_4.Alert>
					);
				},
				500: function () {
					return (
						<index_ts_4.Alert variant="destructive" className="w-2/4">
							<react_icons_1.ExclamationTriangleIcon className="h-4 w-4" />
							<index_ts_4.AlertTitle>Server error</index_ts_4.AlertTitle>
							<index_ts_4.AlertDescription>
								Looks like something bad happened on our server. Already fixing!
							</index_ts_4.AlertDescription>
						</index_ts_4.Alert>
					);
				},
			}}
			unexpectedErrorHandler={function () {
				return <div>Something unexpected happened. Sorry about that.</div>;
			}}
		/>
	);
};
exports.ErrorBoundary = ErrorBoundary;
