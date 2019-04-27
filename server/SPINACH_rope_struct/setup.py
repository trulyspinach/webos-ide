from distutils.core import setup, Extension

module1 = Extension('spinach_rope',
                    sources = ['is_rope.c'])

setup (name = 'SPINACH Rope Data Structure',
       version = '1.0',
       description = 'This is the best computing package',
       ext_modules = [module1])
