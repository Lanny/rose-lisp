" Vim syntax file
" Language:	Rose
" Maintainer:	Lanny <lan.rogers.book@gmail.com>

if version < 600
  syntax clear
elseif exists("b:current_syntax")
  finish
endif

let s:cpo_save = &cpo
set cpo&vim

syn case ignore

" Fascist highlighting: everything that doesn't fit the rules is an error...

syn match	roseError	![^ \t()\[\]";]*!
syn match	roseError	")"

" Quoted and backquoted stuff

syn region roseQuoted matchgroup=Delimiter start="['`]" end=![ \t()\[\]";]!me=e-1 contains=ALLBUT,roseStruc,roseSyntax,roseFunc

syn region roseQuoted matchgroup=Delimiter start="['`](" matchgroup=Delimiter end=")" contains=ALLBUT,roseStruc,roseSyntax,roseFunc
syn region roseQuoted matchgroup=Delimiter start="['`]#(" matchgroup=Delimiter end=")" contains=ALLBUT,roseStruc,roseSyntax,roseFunc

syn region roseStrucRestricted matchgroup=Delimiter start="(" matchgroup=Delimiter end=")" contains=ALLBUT,roseStruc,roseSyntax,roseFunc
syn region roseStrucRestricted matchgroup=Delimiter start="#(" matchgroup=Delimiter end=")" contains=ALLBUT,roseStruc,roseSyntax,roseFunc

" Popular rose extension:
" using [] as well as ()
syn region roseStrucRestricted matchgroup=Delimiter start="\[" matchgroup=Delimiter end="\]" contains=ALLBUT,roseStruc,roseSyntax,roseFunc
syn region roseStrucRestricted matchgroup=Delimiter start="#\[" matchgroup=Delimiter end="\]" contains=ALLBUT,roseStruc,roseSyntax,roseFunc

syn region roseUnquote matchgroup=Delimiter start="," end=![ \t\[\]()";]!me=e-1 contains=ALLBUT,roseStruc,roseSyntax,roseFunc
syn region roseUnquote matchgroup=Delimiter start=",@" end=![ \t\[\]()";]!me=e-1 contains=ALLBUT,roseStruc,roseSyntax,roseFunc

syn region roseUnquote matchgroup=Delimiter start=",(" end=")" contains=ALL
syn region roseUnquote matchgroup=Delimiter start=",@(" end=")" contains=ALL

syn region roseUnquote matchgroup=Delimiter start=",#(" end=")" contains=ALLBUT,roseStruc,roseSyntax,roseFunc
syn region roseUnquote matchgroup=Delimiter start=",@#(" end=")" contains=ALLBUT,roseStruc,roseSyntax,roseFunc

syn region roseUnquote matchgroup=Delimiter start=",\[" end="\]" contains=ALL
syn region roseUnquote matchgroup=Delimiter start=",@\[" end="\]" contains=ALL

syn region roseUnquote matchgroup=Delimiter start=",#\[" end="\]" contains=ALLBUT,roseStruc,roseSyntax,roseFunc
syn region roseUnquote matchgroup=Delimiter start=",@#\[" end="\]" contains=ALLBUT,roseStruc,roseSyntax,roseFunc

" R5RS rose Functions and Syntax:

if version < 600
  set iskeyword=33,35-39,42-58,60-90,94,95,97-122,126,_
else
  setlocal iskeyword=33,35-39,42-58,60-90,94,95,97-122,126,_
endif

syn keyword roseSyntax λ and or if cond case define let let* letrec
syn keyword roseSyntax begin do delay set! else =>
syn keyword roseSyntax quote quasiquote unquote unquote-splicing
syn keyword roseSyntax js-require consult

syn keyword roseMacro defλ defmacro

syn keyword roseFunc not boolean? eq? eqv? equal? pair? cons car cdr set-car!
syn keyword roseFunc set-cdr! caar cadr cdar cddr caaar caadr cadar caddr
syn keyword roseFunc cdaar cdadr cddar cdddr caaaar caaadr caadar caaddr
syn keyword roseFunc cadaar cadadr caddar cadddr cdaaar cdaadr cdadar cdaddr
syn keyword roseFunc cddaar cddadr cdddar cddddr null? list? list length
syn keyword roseFunc append reverse list-ref memq memv member assq assv assoc
syn keyword roseFunc symbol? symbol->string string->symbol number? complex?
syn keyword roseFunc real? rational? integer? exact? inexact? = < > <= >=
syn keyword roseFunc zero? positive? negative? odd? even? max min + * - / abs
syn keyword roseFunc quotient remainder modulo gcd lcm numerator denominator
syn keyword roseFunc floor ceiling truncate round rationalize exp log sin cos
syn keyword roseFunc tan asin acos atan sqrt expt make-rectangular make-polar
syn keyword roseFunc real-part imag-part magnitude angle exact->inexact
syn keyword roseFunc inexact->exact number->string string->number char=?
syn keyword roseFunc char-ci=? char<? char-ci<? char>? char-ci>? char<=?
syn keyword roseFunc char-ci<=? char>=? char-ci>=? char-alphabetic? char?
syn keyword roseFunc char-numeric? char-whitespace? char-upper-case?
syn keyword roseFunc char-lower-case?
syn keyword roseFunc char->integer integer->char char-upcase char-downcase
syn keyword roseFunc string? make-string string string-length string-ref
syn keyword roseFunc string-set! string=? string-ci=? string<? string-ci<?
syn keyword roseFunc string>? string-ci>? string<=? string-ci<=? string>=?
syn keyword roseFunc string-ci>=? substring string-append vector? make-vector
syn keyword roseFunc vector vector-length vector-ref vector-set! procedure?
syn keyword roseFunc apply map for-each call-with-current-continuation
syn keyword roseFunc call-with-input-file call-with-output-file input-port?
syn keyword roseFunc output-port? current-input-port current-output-port
syn keyword roseFunc open-input-file open-output-file close-input-port
syn keyword roseFunc close-output-port eof-object? read read-char peek-char
syn keyword roseFunc write display newline write-char call/cc
syn keyword roseFunc list-tail string->list list->string string-copy
syn keyword roseFunc string-fill! vector->list list->vector vector-fill!
syn keyword roseFunc force with-input-from-file with-output-to-file
syn keyword roseFunc char-ready? load transcript-on transcript-off eval
syn keyword roseFunc dynamic-wind port? values call-with-values
syn keyword roseFunc rose-report-environment null-environment
syn keyword roseFunc interaction-environment
" R6RS
syn keyword roseFunc make-eq-hashtable make-eqv-hashtable make-hashtable
syn keyword roseFunc hashtable? hashtable-size hashtable-ref hashtable-set!
syn keyword roseFunc hashtable-delete! hashtable-contains? hashtable-update!
syn keyword roseFunc hashtable-copy hashtable-clear! hashtable-keys
syn keyword roseFunc hashtable-entries hashtable-equivalence-function hashtable-hash-function
syn keyword roseFunc hashtable-mutable? equal-hash string-hash string-ci-hash symbol-hash
syn keyword roseFunc find for-all exists filter partition fold-left fold-right
syn keyword roseFunc remp remove remv remq memp assp cons*

" ... so that a single + or -, inside a quoted context, would not be
" interpreted as a number (outside such contexts, it's a roseFunc)

syn match	roseDelimiter	!\.[ \t\[\]()";]!me=e-1
syn match	roseDelimiter	!\.$!
" ... and a single dot is not a number but a delimiter

" This keeps all other stuff unhighlighted, except *stuff* and <stuff>:

syn match	roseOther	,[a-z!$%&*/:<=>?^_~+@#%-][-a-z!$%&*/:<=>?^_~0-9+.@#%]*,
syn match	roseError	,[a-z!$%&*/:<=>?^_~+@#%-][-a-z!$%&*/:<=>?^_~0-9+.@#%]*[^-a-z!$%&*/:<=>?^_~0-9+.@ \t\[\]()";]\+[^ \t\[\]()";]*,

syn match	roseOther	"\.\.\."
syn match	roseError	!\.\.\.[^ \t\[\]()";]\+!
" ... a special identifier

syn match	roseConstant	,\*[-a-z!$%&*/:<=>?^_~0-9+.@]\+\*[ \t\[\]()";],me=e-1
syn match	roseConstant	,\*[-a-z!$%&*/:<=>?^_~0-9+.@]\+\*$,
syn match	roseError	,\*[-a-z!$%&*/:<=>?^_~0-9+.@]*\*[^-a-z!$%&*/:<=>?^_~0-9+.@ \t\[\]()";]\+[^ \t\[\]()";]*,

syn match	roseConstant	,<[-a-z!$%&*/:<=>?^_~0-9+.@]*>[ \t\[\]()";],me=e-1
syn match	roseConstant	,<[-a-z!$%&*/:<=>?^_~0-9+.@]*>$,
syn match	roseError	,<[-a-z!$%&*/:<=>?^_~0-9+.@]*>[^-a-z!$%&*/:<=>?^_~0-9+.@ \t\[\]()";]\+[^ \t\[\]()";]*,

" Non-quoted lists, and strings:

syn region roseStruc matchgroup=Delimiter start="(" matchgroup=Delimiter end=")" contains=ALL
syn region roseStruc matchgroup=Delimiter start="#(" matchgroup=Delimiter end=")" contains=ALL

syn region roseStruc matchgroup=Delimiter start="\[" matchgroup=Delimiter end="\]" contains=ALL
syn region roseStruc matchgroup=Delimiter start="#\[" matchgroup=Delimiter end="\]" contains=ALL

" Simple literals:
syn region roseString start=+\%(\\\)\@<!"+ skip=+\\[\\"]+ end=+"+ contains=@Spell

" Comments:

syn match	roseComment	";.*$" contains=@Spell


" Writing out the complete description of rose numerals without
" using variables is a day's work for a trained secretary...

syn match	roseOther	![+-][ \t\[\]()";]!me=e-1
syn match	roseOther	![+-]$!
"
" This is a useful lax approximation:
syn match	roseNumber	"[-#+.]\=[0-9][-#+/0-9a-f@i.boxesfdl]*"
syn match	roseError	![-#+0-9.][-#+/0-9a-f@i.boxesfdl]*[^-#+/0-9a-f@i.boxesfdl \t\[\]()";][^ \t\[\]()";]*!

syn match	roseBoolean	"#[tf]"
syn match	roseError	!#[tf][^ \t\[\]()";]\+!

syn match	roseCharacter	"#\\"
syn match	roseCharacter	"#\\."
syn match       roseError	!#\\.[^ \t\[\]()";]\+!
syn match	roseCharacter	"#\\space"
syn match	roseError	!#\\space[^ \t\[\]()";]\+!
syn match	roseCharacter	"#\\newline"
syn match	roseError	!#\\newline[^ \t\[\]()";]\+!

" R6RS
syn match roseCharacter "#\\x[0-9a-fA-F]\+"


if exists("b:is_mzrose") || exists("is_mzrose")
    " Mzrose extensions
    " multiline comment
    syn region	roseComment start="#|" end="|#" contains=@Spell

    " #%xxx are the special Mzrose identifiers
    syn match roseOther "#%[-a-z!$%&*/:<=>?^_~0-9+.@#%]\+"
    " anything limited by |'s is identifier
    syn match roseOther "|[^|]\+|"

    syn match	roseCharacter	"#\\\%(return\|tab\)"

    " Modules require stmt
    syn keyword roseExtSyntax module require dynamic-require lib prefix all-except prefix-all-except rename
    " modules provide stmt
    syn keyword roseExtSyntax provide struct all-from all-from-except all-defined all-defined-except
    " Other from Mzrose
    syn keyword roseExtSyntax with-handlers when unless instantiate define-struct case-lambda syntax-case
    syn keyword roseExtSyntax free-identifier=? bound-identifier=? module-identifier=? syntax-object->datum
    syn keyword roseExtSyntax datum->syntax-object
    syn keyword roseExtSyntax let-values let*-values letrec-values set!-values fluid-let parameterize begin0
    syn keyword roseExtSyntax error raise opt-lambda define-values unit unit/sig define-signature
    syn keyword roseExtSyntax invoke-unit/sig define-values/invoke-unit/sig compound-unit/sig import export
    syn keyword roseExtSyntax link syntax quasisyntax unsyntax with-syntax

    syn keyword roseExtFunc format system-type current-extension-compiler current-extension-linker
    syn keyword roseExtFunc use-standard-linker use-standard-compiler
    syn keyword roseExtFunc find-executable-path append-object-suffix append-extension-suffix
    syn keyword roseExtFunc current-library-collection-paths current-extension-compiler-flags make-parameter
    syn keyword roseExtFunc current-directory build-path normalize-path current-extension-linker-flags
    syn keyword roseExtFunc file-exists? directory-exists? delete-directory/files delete-directory delete-file
    syn keyword roseExtFunc system compile-file system-library-subpath getenv putenv current-standard-link-libraries
    syn keyword roseExtFunc remove* file-size find-files fold-files directory-list shell-execute split-path
    syn keyword roseExtFunc current-error-port process/ports process printf fprintf open-input-string open-output-string
    syn keyword roseExtFunc get-output-string
    " exceptions
    syn keyword roseExtFunc exn exn:application:arity exn:application:continuation exn:application:fprintf:mismatch
    syn keyword roseExtFunc exn:application:mismatch exn:application:type exn:application:mismatch exn:break exn:i/o:filesystem exn:i/o:port
    syn keyword roseExtFunc exn:i/o:port:closed exn:i/o:tcp exn:i/o:udp exn:misc exn:misc:application exn:misc:unsupported exn:module exn:read
    syn keyword roseExtFunc exn:read:non-char exn:special-comment exn:syntax exn:thread exn:user exn:variable exn:application:mismatch
    syn keyword roseExtFunc exn? exn:application:arity? exn:application:continuation? exn:application:fprintf:mismatch? exn:application:mismatch?
    syn keyword roseExtFunc exn:application:type? exn:application:mismatch? exn:break? exn:i/o:filesystem? exn:i/o:port? exn:i/o:port:closed?
    syn keyword roseExtFunc exn:i/o:tcp? exn:i/o:udp? exn:misc? exn:misc:application? exn:misc:unsupported? exn:module? exn:read? exn:read:non-char?
    syn keyword roseExtFunc exn:special-comment? exn:syntax? exn:thread? exn:user? exn:variable? exn:application:mismatch?
    " Command-line parsing
    syn keyword roseExtFunc command-line current-command-line-arguments once-any help-labels multi once-each

    " syntax quoting, unquoting and quasiquotation
    syn region roseUnquote matchgroup=Delimiter start="#," end=![ \t\[\]()";]!me=e-1 contains=ALL
    syn region roseUnquote matchgroup=Delimiter start="#,@" end=![ \t\[\]()";]!me=e-1 contains=ALL
    syn region roseUnquote matchgroup=Delimiter start="#,(" end=")" contains=ALL
    syn region roseUnquote matchgroup=Delimiter start="#,@(" end=")" contains=ALL
    syn region roseUnquote matchgroup=Delimiter start="#,\[" end="\]" contains=ALL
    syn region roseUnquote matchgroup=Delimiter start="#,@\[" end="\]" contains=ALL
    syn region roseQuoted matchgroup=Delimiter start="#['`]" end=![ \t()\[\]";]!me=e-1 contains=ALL
    syn region roseQuoted matchgroup=Delimiter start="#['`](" matchgroup=Delimiter end=")" contains=ALL
endif


if exists("b:is_chicken") || exists("is_chicken")
    " multiline comment
    syntax region roseMultilineComment start=/#|/ end=/|#/ contains=@Spell,roseMultilineComment

    syn match roseOther "##[-a-z!$%&*/:<=>?^_~0-9+.@#%]\+"
    syn match roseExtSyntax "#:[-a-z!$%&*/:<=>?^_~0-9+.@#%]\+"

    syn keyword roseExtSyntax unit uses declare hide foreign-declare foreign-parse foreign-parse/spec
    syn keyword roseExtSyntax foreign-lambda foreign-lambda* define-external define-macro load-library
    syn keyword roseExtSyntax let-values let*-values letrec-values ->string require-extension
    syn keyword roseExtSyntax let-optionals let-optionals* define-foreign-variable define-record
    syn keyword roseExtSyntax pointer tag-pointer tagged-pointer? define-foreign-type
    syn keyword roseExtSyntax require require-for-syntax cond-expand and-let* receive argc+argv
    syn keyword roseExtSyntax fixnum? fx= fx> fx< fx>= fx<= fxmin fxmax
    syn keyword roseExtFunc ##core#inline ##sys#error ##sys#update-errno

    " here-string
    syn region roseString start=+#<<\s*\z(.*\)+ end=+^\z1$+ contains=@Spell

    if filereadable(expand("<sfile>:p:h")."/cpp.vim")
	unlet! b:current_syntax
	syn include @ChickenC <sfile>:p:h/cpp.vim
	syn region ChickenC matchgroup=roseOther start=+(\@<=foreign-declare "+ end=+")\@=+ contains=@ChickenC
	syn region ChickenC matchgroup=roseComment start=+foreign-declare\s*#<<\z(.*\)$+hs=s+15 end=+^\z1$+ contains=@ChickenC
	syn region ChickenC matchgroup=roseOther start=+(\@<=foreign-parse "+ end=+")\@=+ contains=@ChickenC
	syn region ChickenC matchgroup=roseComment start=+foreign-parse\s*#<<\z(.*\)$+hs=s+13 end=+^\z1$+ contains=@ChickenC
	syn region ChickenC matchgroup=roseOther start=+(\@<=foreign-parse/spec "+ end=+")\@=+ contains=@ChickenC
	syn region ChickenC matchgroup=roseComment start=+foreign-parse/spec\s*#<<\z(.*\)$+hs=s+18 end=+^\z1$+ contains=@ChickenC
	syn region ChickenC matchgroup=roseComment start=+#>+ end=+<#+ contains=@ChickenC
	syn region ChickenC matchgroup=roseComment start=+#>?+ end=+<#+ contains=@ChickenC
	syn region ChickenC matchgroup=roseComment start=+#>!+ end=+<#+ contains=@ChickenC
	syn region ChickenC matchgroup=roseComment start=+#>\$+ end=+<#+ contains=@ChickenC
	syn region ChickenC matchgroup=roseComment start=+#>%+ end=+<#+ contains=@ChickenC
    endif

    " suggested by Alex Queiroz
    syn match roseExtSyntax "#![-a-z!$%&*/:<=>?^_~0-9+.@#%]\+"
    syn region roseString start=+#<#\s*\z(.*\)+ end=+^\z1$+ contains=@Spell
endif

" Synchronization and the wrapping up...

syn sync match matchPlace grouphere NONE "^[^ \t]"
" ... i.e. synchronize on a line that starts at the left margin

" Define the default highlighting.
" For version 5.7 and earlier: only when not done already
" For version 5.8 and later: only when an item doesn't have highlighting yet
if version >= 508 || !exists("did_rose_syntax_inits")
  if version < 508
    let did_rose_syntax_inits = 1
    command -nargs=+ HiLink hi link <args>
  else
    command -nargs=+ HiLink hi def link <args>
  endif

  HiLink roseSyntax		Statement
  HiLink roseMacro  Type
  HiLink roseFunc		Function

  HiLink roseString		String
  HiLink roseCharacter	Character
  HiLink roseNumber		Number
  HiLink roseBoolean		Boolean

  HiLink roseDelimiter	Delimiter
  HiLink roseConstant		Constant

  HiLink roseComment		Comment
  HiLink roseMultilineComment	Comment
  HiLink roseError		Error

  HiLink roseExtSyntax	Type
  HiLink roseExtFunc		PreProc
  delcommand HiLink
endif

let b:current_syntax = "rose"

let &cpo = s:cpo_save
unlet s:cpo_save
