#define PY_SSIZE_T_CLEAN
#include <Python.h>
#include <stdio.h>
#include <stdlib.h>
#include "structmember.h"

typedef struct rope_bin_tree_node {
    struct rope_bin_tree_node *parent;
    struct rope_bin_tree_node *left;
    struct rope_bin_tree_node *right;

    int w_self;
    int w_all;
    Py_ssize_t utf8size_all;
    PyObject *val;

} tnode;

tnode *
rope_tnode_alloc(PyObject *str) {
    Py_INCREF(str);
    tnode *n = calloc(sizeof(tnode), 1);
    Py_ssize_t encoded_size = 0;
    PyUnicode_AsUTF8AndSize(str, &encoded_size);

    n->val = str;
    n->w_self = PyUnicode_GetLength(n->val);

    // Newly created node is leaf.
    n->w_all = n->w_self;
    n->utf8size_all = encoded_size;

    return n;
}

tnode *
rope_tnode_alloc_empty() {
    tnode *n = calloc(sizeof(tnode), 1);
    return n;
}

void rope_tree_dealloc(tnode *n) {
    //TODO: rewrite without recur to ensure safety.
    if (n->left) rope_tree_dealloc(n->left);
    if (n->right) rope_tree_dealloc(n->right);

    Py_DECREF(n->val);
    free(n);
}

char rope_is_leaf(tnode *n) {
    return (!(n->left) && !(n->right));
}

tnode *
rope_tree_concat(tnode *l, tnode *r) {
    tnode *root = rope_tnode_alloc_empty();
    root->left = l;
    l->parent = root;
    root->right = r;
    r->parent = root;
    root->w_self = l->w_all;
    root->w_all = l->w_all + r->w_all;
    root->utf8size_all = l->utf8size_all + r->utf8size_all;
    return root;
}

PyObject *
rope_tree_index(tnode *l, int index) {
    int start = 0;
    while (!rope_is_leaf(l)) {
        if (index - start < l->w_self) {
            l = l->left;
        } else {
            start += l->w_self;
            l = l->right;
        }
    }
    return PyUnicode_Substring(l->val, index - start, index - start + 1);
}

tnode *
rope_tree_split(tnode *old, int index) {
    int start = 0;
    tnode *curNode = NULL;
    tnode *l = old;
    while (!rope_is_leaf(l)) {
        if (index - start < l->w_self) {
            l = l->left;
        } else {
            start += l->w_self;
            l = l->right;
        }
    }
    // Right inclusive
    tnode *nr = rope_tnode_alloc(PyUnicode_Substring(l->val, index - start, PyUnicode_GET_LENGTH(l->val)));
    curNode = nr;
    l->val = PyUnicode_Substring(l->val, 0, index - start);
    l->w_all = PyUnicode_GetLength(l->val);
    Py_ssize_t s = 0;
    PyUnicode_AsUTF8AndSize(l->val, &s);
    l->utf8size_all = s;
    l->w_self = l->w_all;

    int w_selfChange = 0;
    int w_allChange;
    int w_utfChange;
    if(l != old){
        
        printf("s2 %d %d\n", l->parent->w_self, l->w_all);
        int val = 0;
        int val2 = 0;
        if(l->parent->left == l && l->parent->right != NULL){
           w_selfChange = l->parent->w_self - l->w_all;
            val = l->parent->right->utf8size_all;
            val2 = l->parent->right->w_all;
        }
        if(l->parent->right == l && l->parent->left != NULL){
            w_selfChange = 0;
            val = l->parent->left->utf8size_all;
            val2 = l->parent->left->w_all;
        }
        w_utfChange = l->parent->utf8size_all - l->utf8size_all - val;
        w_allChange = l->parent->w_all - l->w_all - val2;
    }
    //printf("%d %d %d\n", w_selfChange, w_allChange, w_utfChange);
    while(l != old){
        if(l->parent->left == l){
            l->parent->w_self -= w_selfChange;
            if(l->parent->right){
                w_allChange += l->parent->right->w_all;
                w_utfChange += l->parent->right->utf8size_all;
                w_selfChange += l->parent->right->w_self;
                curNode = rope_tree_concat(curNode, l->parent->right);
                l->parent->right = NULL;
            }
            l->parent->w_all -=w_allChange;
            l->parent->utf8size_all -= w_utfChange;
        }else{
            printf("s %d\n", w_selfChange);
            l->parent->w_self -= w_selfChange;
            l->parent->w_all -=w_allChange;
            l->parent->utf8size_all -= w_utfChange;
        }
        l = l->parent;
    }
    // printf("%p %p %p %p %p\n", old, old->left, old->right, old->left->left, old->left->right);
    // printf("%d %d %d, %d %d %d, %d %d %d\n", old->w_self, old->w_all, old->utf8size_all,
    //        old->left->w_self, old->left->w_all, old->left->utf8size_all,
    //        old->left->left->w_self, old->left->left->w_all, old->left->left->utf8size_all);

    // printf("%p %p %p %p %p\n", old, old->left, old->right, old->left->left, old->left->right);
    // printf("%d %d %d, %d %d %d, %d %d %d\n", old->w_self, old->w_all, old->utf8size_all,
    //        old->left->w_self, old->left->w_all, old->left->utf8size_all,
    //        old->left->left->w_self, old->left->left->w_all, old->left->left->utf8size_all);
    // //old->left->right->w_self, old->left->right->w_all, old->left->right->utf8size_all);

    // printf("%p %p %p %p %p, %p %p %p %p %p %p\n", curNode, curNode->left, curNode->right, curNode->left->left, curNode->left->right,
    //     curNode->left->left->left, curNode->left->left->right, curNode->left->right->left, curNode->left->right->left, curNode->right->left, curNode->right->right
    // );
    // printf("%d %d %d, %d %d %d, %d %d %d, %d %d %d, %d %d %d\n", curNode->w_self, curNode->w_all, curNode->utf8size_all,
    //        curNode->left->w_self, curNode->left->w_all, curNode->left->utf8size_all,
    //        curNode->left->left->w_self, curNode->left->left->w_all, curNode->left->left->utf8size_all,
    //        curNode->left->right->w_self, curNode->left->right->w_all, curNode->left->right->utf8size_all,
    //        curNode->right->w_self, curNode->right->w_all, curNode->right->utf8size_all);
    return curNode;
}

tnode *
rope_tree_insert(tnode *self, int index, PyObject *st) {
    tnode *newStr = rope_tnode_alloc(st);
    printf("%d %d %d, %d %d %d\n", self->w_self, self->w_all, self->utf8size_all, 
    self->left->w_self, self->left->w_all, self->left->utf8size_all);
    tnode *right = rope_tree_split(self, index);
    
    self = rope_tree_concat(self, newStr);
    self = rope_tree_concat(self, right);
    printf("%p %p %p %p %p %p\n", self, self->left, self->left->left, self->left->left->left, self->left->right, self->right);
    printf("%d %d %d, %d %d %d, %d %d %d, %d %d %d, %d %d %d, %d %d %d\n", self->w_self, self->w_all, self->utf8size_all,
           self->left->w_self, self->left->w_all, self->left->utf8size_all,
           self->left->left->w_self, self->left->left->w_all, self->left->left->utf8size_all,
           self->left->left->left->w_self, self->left->left->left->w_all, self->left->left->left->utf8size_all,
           self->left->right->w_self, self->left->right->w_all, self->left->right->utf8size_all,
           self->right->w_self, self->right->w_all, self->right->utf8size_all );
    return self;
}

tnode *
rope_tree_delete(tnode *left, int l, int r) {
    tnode *right = rope_tree_split(left, l);
    printf("%d %d %d %d\n", l, r, left->w_all, right->w_all);
    right = rope_tree_split(right, r - left->w_all);
    left = rope_tree_concat(left, right);
    return left;
}


PyObject *
rope_concat_unicode(PyObject *a, PyObject *b) {
    Py_ssize_t size_a = 0, size_b = 0;
    const char *buf_a = PyUnicode_AsUTF8AndSize(a, &size_a);
    const char *buf_b = PyUnicode_AsUTF8AndSize(b, &size_b);

    //use stack so avoid small mallocs
    char *buf = malloc(size_a + size_b);
    memcpy(buf, buf_a, size_a);
    memcpy(buf + size_a, buf_b, size_b);

    PyObject *str = PyUnicode_DecodeUTF8((char *)buf, size_a + size_b, NULL);
    if (!str) {
        printf("something fucked up.\n");
    }

    return str;
}

void rope_inorder_UTF8_str(tnode *from, char *buf, Py_ssize_t *start) {
    if (rope_is_leaf(from)) {
        Py_ssize_t s = 0;
        const char *b = PyUnicode_AsUTF8AndSize(from->val, &s);

        memcpy(buf + *start, b, s);
        *start += s;

        return;
    }
    if (from->left) rope_inorder_UTF8_str(from->left, buf, start);
    if (from->right) rope_inorder_UTF8_str(from->right, buf, start);
}

//################
// Type fields
//################
typedef struct {
    PyObject_HEAD
        // PyObject *first; /* first name */
        // PyObject *last;  /* last name */
        tnode *tree_root;
    int number;
} rope_object;

static PyMemberDef rope_MEMBERS[] = {
    {"number", T_INT, offsetof(rope_object, number), 0,
     "dummy number for fun"},

    {NULL}  //end of struct..
};

//################
// Type methods
//################

static void
rope_dealloc(rope_object *self) {
    // Py_XDECREF(self->first);
    // Py_XDECREF(self->last);
    Py_TYPE(self)->tp_free((PyObject *)self);
}

static PyObject *
rope_new_alloc(PyTypeObject *type, PyObject *args, PyObject *kwds) {
    rope_object *self;
    self = (rope_object *)type->tp_alloc(type, 0);
    if (self != NULL) {
        self->number = 0;
    }
    return (PyObject *)self;
}

static int
rope_init(rope_object *self, PyObject *args, PyObject *kwds) {
    Py_ssize_t argc = PyTuple_Size(args);
    if (argc != 1) {
        return 0;
    }

    PyObject *str = NULL;
    PyArg_ParseTuple(args, "U", &str);

    self->tree_root = rope_tnode_alloc(str);
    // printf("%ld\n",self->tree_root->w_self);
    return 0;
}

static PyObject *
rope_get_str(rope_object *self, PyObject *args, PyObject *kwds) {
    //TODO: rewrite without recur to ensure safety.
    //TODO: rewrite encoding with wchars.

    char *buff = malloc(self->tree_root->utf8size_all);
    Py_ssize_t s = 0;
    rope_inorder_UTF8_str(self->tree_root, buff, &s);

    PyObject *str = PyUnicode_DecodeUTF8(buff, self->tree_root->utf8size_all, NULL);

    return Py_BuildValue("O", str);
}

static PyObject *
rope_index_at(rope_object *self, PyObject *args, PyObject *kwds) {
    //TODO: rewrite without recur to ensure safety.
    //TODO: rewrite encoding with wchars.

    long i = 0;
    PyArg_ParseTuple(args, "i", &i);

    PyObject *chari = rope_tree_index(self->tree_root, i);

    return Py_BuildValue("O", chari);
}

static PyObject *
rope_insert(rope_object *self, PyObject *args, PyObject *kwds) {
    //TODO: rewrite without recur to ensure safety.
    //TODO: rewrite encoding with wchars.
    long i = 0;
    PyObject *str;
    PyArg_ParseTuple(args, "iO", &i, &str);
    self->tree_root = rope_tree_insert(self->tree_root, i, str);
    Py_RETURN_NONE;
}

static PyObject *
rope_delete(rope_object *self, PyObject *args, PyObject *kwds) {
    //TODO: rewrite without recur to ensure safety.
    //TODO: rewrite encoding with wchars.
    long l = 0;
    long r = 0;
    PyArg_ParseTuple(args, "ii", &l, &r);
    self->tree_root = rope_tree_delete(self->tree_root, l, r);
    Py_RETURN_NONE;
}

static PyObject *
rope_print_dummy_num(rope_object *self, PyObject *Py_UNUSED(ignored)) {
    printf("Here is your number %d\n", self->number);

    Py_RETURN_NONE;
}

// Register type methods
static PyMethodDef rope_METHODS[] = {
    {"prn_dnum", (PyCFunction)rope_print_dummy_num, METH_NOARGS,
     "Return the dummy number to see if my type is working :)"},
    {"get_str", (PyCFunction)rope_get_str, METH_NOARGS,
     "Construct and return the string from rope object."},
    {"indexat", (PyCFunction)rope_index_at, METH_VARARGS,
     "Get char at index."},
     {"insert", (PyCFunction)rope_insert, METH_VARARGS,
     "Get char at index."},
     {"delete", (PyCFunction)rope_delete, METH_VARARGS,
     "Get char at index."},
    {NULL} /* Sentinel */
};

// Register type.
static PyTypeObject rope_Type = {
    PyVarObject_HEAD_INIT(NULL, 0)
        .tp_name = "spinach_rope.rope",
    .tp_doc = "The implementation of Rope Data Structure by SPINACH. Created to power texting editing in webOS.",
    .tp_basicsize = sizeof(rope_object),
    .tp_itemsize = 0,
    .tp_flags = Py_TPFLAGS_DEFAULT | Py_TPFLAGS_BASETYPE,
    .tp_new = rope_new_alloc,
    .tp_init = (initproc)rope_init,
    .tp_dealloc = (destructor)rope_dealloc,
    .tp_members = rope_MEMBERS,
    .tp_methods = rope_METHODS,
};

//##################
// Module functions
//##################
static PyObject *
rope_concat_rope(PyObject *self, PyObject *args) {
    rope_object *a = NULL, *b = NULL;
    PyArg_ParseTuple(args, "OO", &a, &b);

    tnode *root = rope_tree_concat(a->tree_root, b->tree_root);

    //TODO: a better implementation ?

    PyObject *argList = PyTuple_New(0);
    rope_object *new_rope = (rope_object *)PyObject_CallObject((PyObject *)&rope_Type, argList);
    new_rope->tree_root = root;
    Py_DECREF(argList);

    // Py_RETURN_NONE;
    return Py_BuildValue("O", new_rope);
}

static PyObject *
rope_split_rope(PyObject *self, PyObject *args) {
    rope_object *a = NULL;
    int index = 0;
    PyArg_ParseTuple(args, "Oi", &a, &index);

    tnode *root = rope_tree_split(a->tree_root, index);

    PyObject *argList = PyTuple_New(0);
    rope_object *new_rope = (rope_object *)PyObject_CallObject((PyObject *)&rope_Type, argList);
    new_rope->tree_root = root;
    Py_DECREF(argList);

    // Py_RETURN_NONE;
    return Py_BuildValue("O", new_rope);
}

//##################
// Compile env test
//##################
static PyObject
    *
    compute_useless(PyObject *self) {
    printf("Hello world from c \n");
    Py_RETURN_NONE;
}

static PyObject
    *
    compute_add_two(PyObject *self, PyObject *args) {
    int a, b;
    PyArg_ParseTuple(args, "ii", &a, &b);
    return Py_BuildValue("i", a + b);
}

static PyObject
    *
    compute_str_len(PyObject *self, PyObject *args) {
    PyObject *str = NULL;
    PyArg_ParseTuple(args, "U", &str);

    printf("%ld\n", PyUnicode_GetLength(str));

    return Py_BuildValue("U", str);
}

static PyObject *
compute_str_concat(PyObject *self, PyObject *args) {
    PyObject *a = NULL;
    PyObject *b = NULL;
    PyArg_ParseTuple(args, "UU", &a, &b);
    PyObject *str = rope_concat_unicode(a, b);

    return Py_BuildValue("O", str);
}

//##################
// Module defs. rope_concat_rope
//##################
static PyMethodDef
    IS_MODULE_METHODS[] = {
        {"useless", (PyCFunction)compute_useless, METH_NOARGS, NULL},
        {"add_two", (PyCFunction)compute_add_two, METH_VARARGS, NULL},
        {"strlen", (PyCFunction)compute_str_len, METH_VARARGS, NULL},
        {"strconcat", (PyCFunction)compute_str_concat, METH_VARARGS, NULL},
        {"concat", (PyCFunction)rope_concat_rope, METH_VARARGS, NULL},
        {"split", (PyCFunction)rope_split_rope, METH_VARARGS, NULL},
        {NULL, NULL, 0, NULL}};

static struct
    PyModuleDef IS_MODULE = {
        PyModuleDef_HEAD_INIT,
        "SPINACH Rope Data Structure",
        "Best module ever..",
        -1,
        IS_MODULE_METHODS};

PyMODINIT_FUNC PyInit_spinach_rope() {
    //init the module
    PyObject *m;

    //try init rope type.
    if (PyType_Ready(&rope_Type) < 0) return NULL;

    //try init module.
    m = PyModule_Create(&IS_MODULE);
    if (m == NULL) return NULL;

    //add rope type to module dictionary.
    Py_INCREF(&rope_Type);
    PyModule_AddObject(m, "rope", (PyObject *)&rope_Type);

    //doc said i must do this..
    return m;
}
